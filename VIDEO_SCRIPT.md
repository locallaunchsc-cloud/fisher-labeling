# CDAO ADL Video Submission Script
**Title:** `CDAO ADL: Fisher Intelligent Systems — AI-Native Auto-Labeling Platform`
**Target Length:** 8-10 minutes
**Format:** Screen recording with voiceover narration

---

## Section 1 — Defining the Problem (1:00)

**[SLIDE 1: Title card]**
> Fisher Intelligent Systems
> AI-Native Auto-Labeling for Autonomous Platform Training
> CDAO Enterprise Autonomy Division — Special Topic Submission

**[NARRATION — 30 seconds]**
"The Department of War is fielding a new generation of autonomous systems — drones, ground vehicles, maritime platforms — that need to make precision decisions in real time. Avoid that obstacle. Maintain standoff distance from that vessel. Track that target through occlusion. But the AI behind those decisions is only as good as the labeled data it's trained on."

**[SLIDE 2: The Problem]**
> Current Labeling Limitations:
> ✕ Bounding boxes only
> ✕ Object classification only
> ✕ No pose, occlusion, or environmental context
> Result: Autonomous platforms can't make precision decisions

**[NARRATION — 30 seconds]**
"Today's labeling pipelines are stuck in 2018. Bounding boxes and class labels. That's not enough for next-generation autonomy. CDAO's own RFI states it: autonomous platforms need pose, occlusion, dimensions, weather, lighting, and sensor metadata to inform real-world decisions. The labeling industry has not caught up. We have."

---

## Section 2 — Accelerating the Mission (3:00)

**[SLIDE 3: Solution Overview]**
> Fisher Intelligent Systems Auto-Labeling Platform
> AI-Native · Multi-Modal · COCO + DOTA + BOP Compatible
> Live Demo at fisher-labeling.onrender.com

**[NARRATION — 15 seconds]**
"This is our live, working platform. No mockups, no slides. Let me show you how it works."

**[SCREEN RECORDING — Open https://fisher-labeling.onrender.com]**

**[NARRATION — Single Frame Demo, 1 minute]**
"I'm dropping in a single image frame — could be EO, infrared, or a single FMV frame. The platform sends it to our AI vision pipeline. In under ten seconds, we get back the full annotation set."

*[Click "Auto-Label", wait for results]*

"Here's what's different. Look at this output. Bounding boxes — yes, but also..."

*[Point to each panel]*

- "Scene conditions: weather, lighting, light source orientation, visibility quality."
- "Sensor metadata: domain — maritime, aerial, terrestrial — sensor type, look angle, distortion factors."
- "And for each detected object: oriented bounding boxes — that's DOTA-style format. Six degrees of freedom pose — yaw, pitch, roll, bearing — that's BOP format. Plus estimated dimensions, occlusion percentage, and key feature descriptions for semantic segmentation."

**[NARRATION — Switch to Batch Mode, 1 minute]**

*[Click "FMV Batch (Multi-Frame)" toggle]*

"Now let me show batch processing. Real autonomous training requires full-motion video — not single frames. I'm dropping in a sequence of FMV frames."

*[Drop multiple images, click Auto-Label]*

"The platform processes each frame sequentially, building a unified COCO-JSON output across the entire sequence. You can see each frame being labeled in real time. When complete, every frame in the grid has annotations — and the combined JSON is ready to drop directly into a CV training pipeline."

**[NARRATION — IL5 Capability, 30 seconds]**

**[SLIDE 4: IL5 Deployment Path]**
> Government IL5 Network Compatible
> Architected on AWS GovCloud / Azure Government infrastructure
> Air-gapped deployment supported via on-premises model hosting
> All processing US-based · No data retention · FedRAMP-aligned controls

"For IL5 compatibility: the platform is architected for government cloud deployment via AWS GovCloud or Azure Government, both of which have authorized FedRAMP High and IL5 baselines. For air-gapped environments, we support on-premises deployment with open-weight vision models. All processing happens within U.S. boundaries. No inference data is retained."

---

## Section 3 — Advancing the State of the Art (2:30)

**[SLIDE 5: Format Compliance]**
> Output Formats — Native Compliance
> ✓ COCO-JSON for detections, segmentations, key points
> ✓ DOTA extension for oriented bounding boxes
> ✓ BOP extension for 6DoF pose and scale
> Drop-in compatible with PyTorch, TensorFlow, MMDetection pipelines

**[NARRATION — 45 seconds]**
"The CDAO RFI specifies COCO-JSON with DOTA-style oriented bounding boxes and BOP-style 6DoF pose extensions. Most providers force you to use proprietary formats. We output the exact formats specified — natively. No conversion layer. No middleware. Drop it directly into your existing CV training pipeline."

**[SCREEN RECORDING — Show JSON output]**

*[Scroll through the JSON in the platform]*

"Look at this output. Every standard COCO field is here. The `oriented_bbox` field carries the DOTA extension with center, width, height, and rotation angle. The `pose_6dof` field carries BOP-compatible yaw, pitch, roll, and bearing. This is production-ready training data."

**[SLIDE 6: Speed and Scale]**
> Speed: 5-10 seconds per frame · 100x faster than human labeling
> Scale: Parallel API processing · No per-seat licensing
> Cost: 90% reduction vs traditional human-in-the-loop services
> Quality: AI-first, human review optional for high-stakes datasets

**[NARRATION — 60 seconds]**
"Traditional labeling services use offshore human annotators. Five to fifteen dollars per image. Days to weeks of turnaround. Variable quality. We use frontier vision AI as the primary labeling engine — five to ten seconds per frame. One hundred times faster. Roughly ninety percent cost reduction. And the quality compounds — every model upgrade improves all downstream output, automatically."

**[NARRATION — 45 seconds]**
"What makes this novel: we're not selling labeling-as-a-headcount. We're selling labeling-as-an-API. That changes the unit economics of training autonomous systems. CDAO can label millions of frames at a budget that today only buys thousands. That's the state-of-the-art shift."

---

## Section 4 — Business Model (1:30)

**[SLIDE 7: Pricing Model]**
> Fixed-Price Per Frame
> $0.25 — Standard EO/IR frame, single object
> $0.50 — Complex multi-object scene
> $1.00 — Full FMV frame with semantic segmentation
> Volume discounts at 100K+ frames

**[NARRATION — 30 seconds]**
"Our business model is fixed-price per frame labeled. Standard rate is twenty-five cents per EO or IR frame with single-object labeling. Fifty cents for complex multi-object scenes. One dollar for full FMV frames with semantic segmentation. Volume discounts apply above one hundred thousand frames. Government can predict total cost upfront — number of frames, multiplied by rate."

**[SLIDE 8: Long-Term Viability]**
> Long-Term Adoption Path
> ✓ API-first integration · No vendor lock-in
> ✓ Cost decreases over time as AI vision improves
> ✓ Compatible with existing CV training pipelines
> ✓ Scales from 1 frame to 1M+ frames without infrastructure changes

**[NARRATION — 30 seconds]**
"For long-term viability: this platform sits on top of frontier vision AI, which is improving every quarter. As models get better and cheaper, our service gets better and cheaper — automatically passed through to the customer. We're API-first, so adoption requires no infrastructure changes from CDAO. Drop the API endpoint into your existing training pipeline and label data starts flowing."

**[SLIDE 9: Closing]**
> Fisher Intelligent Systems
> Live Demo: https://fisher-labeling.onrender.com
> Jalen Griffin, CEO
> locallaunchsc@gmail.com · (803) 528-3775
> Submitted: CDAO Enterprise Autonomy Division — Advanced Data Labeling Special Topic

**[NARRATION — 15 seconds]**
"This platform is live, deployed, and working. We are ready to support CDAO's autonomous systems mission with production-grade auto-labeling at scale. Fisher Intelligent Systems. Thank you."

---

## Recording Checklist

**Before recording:**
- [ ] Test the platform with 3-5 different sample images so you know what it'll output
- [ ] Have batch test images ready (5-8 different aerial/maritime/vehicle photos work great)
- [ ] Close all browser tabs except the demo
- [ ] Use a clean Chrome profile (no extensions, no bookmarks bar)
- [ ] Test microphone audio levels

**Recording tools (free):**
- **OBS Studio** — best quality, full control
- **Windows Game Bar** — Win+G, built-in, simpler
- **Loom** — free 5-min tier (paid for longer videos)

**Recording settings:**
- Resolution: 1920x1080 minimum
- Frame rate: 30fps
- Audio: 44.1kHz, mono is fine

**Slide creation:**
- Use Canva, Google Slides, or Keynote for the slide cards (Sections 1, 3, 4)
- Keep slides minimal — bullet points only, no walls of text
- Match the platform's blue/cyan color scheme (#0ea5e9, #22d3ee on dark navy)

---

## Submission Checklist

**Pre-submission:**
- [ ] Register at https://www.tradewindai.com/tw-marketplace
- [ ] Read TSM Announcement v10.0 (linked from SAM.gov posting)
- [ ] Confirm video meets length and format requirements

**Submission form fields:**
- Submission Type: `Special Topic Submission`
- Strategic Focus Area: `CDAO Data Labeling Special Topic`
- Video Title: `CDAO ADL: Fisher Intelligent Systems — AI-Native Auto-Labeling Platform`

**Deadline:** June 9, 2026 — 12:00PM EST

**Assessment period:** June 10 – July 7, 2026
**Notification:** On or immediately after July 7, 2026
