const express = require('express');
const multer = require('multer');
const Anthropic = require('@anthropic-ai/sdk');
const path = require('path');

const app = express();
app.use(express.json({ limit: '20mb' }));
app.use(express.static('public'));

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 15 * 1024 * 1024 } });
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are an advanced computer vision data labeling system for the U.S. Department of War CDAO Enterprise Autonomy Division. Your role is to analyze imagery (EO/IR / FMV frames) and produce COCO-JSON formatted annotations for training autonomous platform CV models.

For each image, generate annotations beyond simple bounding boxes — include the rich metadata required for training next-generation autonomous systems.

Your output MUST be valid JSON matching this exact schema. Do not include any text before or after the JSON.

{
  "image_metadata": {
    "domain": "maritime|aerial|terrestrial|sub-surface",
    "sensor_type": "EO|IR|EO/IR|RGB|thermal|multispectral",
    "estimated_resolution": "string description",
    "look_angle": "estimated degrees from nadir, e.g. '45deg oblique'",
    "distortion_factors": ["string array"]
  },
  "scene_conditions": {
    "weather": "sunny|cloudy|partly cloudy|foggy|rainy|snow|hazy|clear",
    "lighting": "daylight|dusk|night|low-light|backlit|overcast",
    "lighting_source_orientation": "front-lit|back-lit|side-lit|top-lit|ambient",
    "visibility_quality": "high|medium|low|very low"
  },
  "annotations": [
    {
      "id": 1,
      "category": "specific object class",
      "category_id": 1,
      "confidence": 0.95,
      "bbox": [x_normalized, y_normalized, width_normalized, height_normalized],
      "oriented_bbox": {
        "cx": 0.5, "cy": 0.5, "w": 0.2, "h": 0.1, "angle_deg": 15
      },
      "estimated_dimensions": {
        "length_m": "estimate or null",
        "width_m": "estimate or null",
        "height_m": "estimate or null"
      },
      "pose_6dof": {
        "yaw_deg": 0,
        "pitch_deg": 0,
        "roll_deg": 0,
        "bearing_relative_to_sensor_deg": 0
      },
      "occlusion_percent": 0,
      "key_features": ["array of distinguishing features visible"],
      "semantic_segmentation_description": "plain-language description of object boundaries and key feature locations"
    }
  ],
  "categories": [
    { "id": 1, "name": "object class", "supercategory": "vehicle|vessel|aircraft|person|infrastructure|other" }
  ]
}

Bounding box coordinates must be normalized 0-1 (top-left origin). Return only valid JSON.`;

function detectMimeType(buffer) {
  if (buffer.length < 12) return null;
  // JPEG: FF D8 FF
  if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) return 'image/jpeg';
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) return 'image/png';
  // GIF: 47 49 46 38
  if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x38) return 'image/gif';
  // WebP: RIFF....WEBP
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
      max_tokens: 4000,
      system: SYSTEM_PROMPT,
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64 } },
          { type: 'text', text: 'Analyze this image and produce the full COCO-JSON annotation with all extended metadata fields. Identify every distinct object visible. Return only the JSON.' }
        ]
      }]
    });

    let text = message.content[0].text.trim();
    // Strip markdown code fences if present
    text = text.replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/\s*```$/, '');

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (e) {
      return res.status(500).json({ error: 'Model returned non-JSON output', raw: text });
    }

    // Wrap in standard COCO container with image record
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
        width: parsed.image_width || null,
        height: parsed.image_height || null
      }],
      ...parsed
    };

    res.json(output);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Fisher Labeling Platform running on port ${PORT}`));
