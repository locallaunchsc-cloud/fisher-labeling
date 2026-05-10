const express = require('express');
const multer = require('multer');
const Anthropic = require('@anthropic-ai/sdk');
const path = require('path');

const app = express();
app.use(express.json({ limit: '20mb' }));
app.use(express.static('public'));

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 15 * 1024 * 1024 } });
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const LABELING_TOOL = {
  name: 'submit_coco_annotation',
  description: 'Submit the complete COCO-JSON annotation set with extended DOTA + BOP metadata for the analyzed image. Always call this tool with full annotation data.',
  input_schema: {
    type: 'object',
    properties: {
      image_metadata: {
        type: 'object',
        properties: {
          domain: { type: 'string', description: 'One of: maritime, aerial, terrestrial, sub-surface' },
          sensor_type: { type: 'string', description: 'One of: EO, IR, EO/IR, RGB, thermal, multispectral' },
          estimated_resolution: { type: 'string' },
          look_angle: { type: 'string', description: 'Estimated degrees from nadir, e.g. "45deg oblique"' },
          distortion_factors: { type: 'array', items: { type: 'string' } }
        },
        required: ['domain', 'sensor_type']
      },
      scene_conditions: {
        type: 'object',
        properties: {
          weather: { type: 'string' },
          lighting: { type: 'string' },
          lighting_source_orientation: { type: 'string' },
          visibility_quality: { type: 'string' }
        },
        required: ['weather', 'lighting']
      },
      annotations: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            category: { type: 'string' },
            category_id: { type: 'integer' },
            confidence: { type: 'number', description: 'Detection confidence 0-1' },
            bbox: {
              type: 'array',
              items: { type: 'number' },
              description: '[x, y, width, height] normalized 0-1, top-left origin'
            },
            oriented_bbox: {
              type: 'object',
              properties: {
                cx: { type: 'number' },
                cy: { type: 'number' },
                w: { type: 'number' },
                h: { type: 'number' },
                angle_deg: { type: 'number' }
              }
            },
            estimated_dimensions: {
              type: 'object',
              properties: {
                length_m: { type: 'string' },
                width_m: { type: 'string' },
                height_m: { type: 'string' }
              }
            },
            pose_6dof: {
              type: 'object',
              properties: {
                yaw_deg: { type: 'number' },
                pitch_deg: { type: 'number' },
                roll_deg: { type: 'number' },
                bearing_relative_to_sensor_deg: { type: 'number' }
              }
            },
            occlusion_percent: { type: 'number' },
            key_features: { type: 'array', items: { type: 'string' } },
            semantic_segmentation_description: { type: 'string' }
          },
          required: ['id', 'category', 'confidence', 'bbox']
        }
      },
      categories: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            supercategory: { type: 'string' }
          },
          required: ['id', 'name']
        }
      }
    },
    required: ['image_metadata', 'scene_conditions', 'annotations', 'categories']
  }
};

const SYSTEM_PROMPT = `You are an advanced computer vision data labeling system for the U.S. Department of War CDAO Enterprise Autonomy Division. Your role is to analyze imagery (EO/IR / FMV frames) and produce COCO-JSON formatted annotations for training autonomous platform CV models.

Always call the submit_coco_annotation tool with your complete analysis. Identify every distinct object visible. Bounding box coordinates must be normalized 0-1 with top-left origin. For maritime/aerial/military imagery, identify vessels, aircraft, vehicles, personnel, and infrastructure with appropriate categorization. Always populate scene_conditions and image_metadata.`;

function detectMimeType(buffer) {
  if (buffer.length < 12) return null;
  if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) return 'image/jpeg';
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) return 'image/png';
  if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x38) return 'image/gif';
  if (buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
      buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50) return 'image/webp';
  return null;
}

app.post('/api/label', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image uploaded' });

    const base64 = req.file.buffer.toString('base64');
    const detected = detectMimeType(req.file.buffer);
    const mediaType = detected || req.file.mimetype;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 8000,
      system: SYSTEM_PROMPT,
      tools: [LABELING_TOOL],
      tool_choice: { type: 'tool', name: 'submit_coco_annotation' },
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64 } },
          { type: 'text', text: 'Analyze this image and submit the full COCO-JSON annotation via the tool. Include every distinct object with extended metadata.' }
        ]
      }]
    });

    const toolUse = message.content.find(b => b.type === 'tool_use');
    if (!toolUse) {
      console.error('No tool_use in response. Stop reason:', message.stop_reason);
      console.error('Content:', JSON.stringify(message.content).substring(0, 800));
      return res.status(500).json({ error: 'Model did not produce structured output. Try a different image.' });
    }

    const parsed = toolUse.input;

    const output = {
      info: {
        description: 'Fisher Intelligent Systems — Advanced CV Auto-Labeling',
        version: '1.0',
        contributor: 'Fisher Intelligent Systems',
        date_created: new Date().toISOString(),
        sponsor: 'CDAO Enterprise Autonomy Division'
      },
      images: [{
        id: 1,
        file_name: req.file.originalname,
        width: null,
        height: null
      }],
      ...parsed
    };

    res.json(output);
  } catch (err) {
    console.error('Labeling error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Fisher Labeling Platform running on port ${PORT}`));
