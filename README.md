# 🦷 DentoDetect

**A web platform for dental caries detection on X-ray images using deep learning (YOLOv8).**

Bachelor's thesis project: *Веб платформа за детекција на кариес на дентални рендген снимки со примена на алгоритми за длабоко учење*
Author: Stefani Eftimovska (211062) · Mentor: Prof. Dr. Ivan Corbev
Faculty of Computer Science and Engineering (FINKI), Ss. Cyril and Methodius University, Skopje, 2026

> ⚠️ **Disclaimer:** DentoDetect is intended for educational and research purposes. It is an assistive tool, **not** a replacement for a qualified dentist, and results must be verified by a dental professional. Not intended for self-diagnosis.

---

## Overview

Dentists upload a dental X-ray and receive, within seconds, the same image annotated with bounding boxes around detected carious lesions, each with a confidence score. The platform wraps a fine-tuned YOLOv8 model in a React + FastAPI web application with user accounts and a personal detection history.

## Features

- 🔐 Registration and login (bcrypt password hashing, OAuth2 Bearer + JWT sessions)
- 🖼️ Drag-and-drop or click-to-browse X-ray upload with live preview
- 🎚️ Adjustable confidence threshold slider (10%–90%)
- 🔍 Caries detection with color-coded bounding boxes:
  - 🟢 green: confidence > 70%
  - 🟠 orange: 50%–70%
  - 🔴 red: < 50%
- 🚦 Severity alert based on number of detections: none (green), 1–2 (yellow), 3–5 (orange), > 5 (red)
- 📊 Result cards: number of detections, inference time (ms), threshold used, plus a per-detection table (confidence, position, size)
- 💾 Download the annotated image, re-analyze with a different threshold, or upload a new image
- 🗂️ Profile page with history of all past detections (download or delete)

## Tech Stack

| Layer | Technologies |
|-------|--------------|
| Presentation | React 18, TypeScript, Tailwind CSS, React Router |
| Application | Python 3.10, FastAPI, Uvicorn (ASGI), Ultralytics YOLOv8 |
| Data | SQLite, SQLAlchemy ORM |

The frontend talks to the backend over REST (HTTP/HTTPS, JSON). The backend validates the JWT, runs inference, stores the result, and returns annotated output for display.

## The Model

- **Architecture:** YOLOv8 (Ultralytics), transfer learning from COCO-pretrained weights
- **Task:** single-class object detection (`caries`)
- **Dataset:** public [Roboflow Universe "exp-caries"](https://universe.roboflow.com/magical/exp-caries), 2,129 bitewing/periapical/panoramic X-rays (1,699 train / 216 val / 214 test), polygon annotations converted to bounding boxes, YOLO `.txt` format
- **Augmentation:** HSV shifts, rotation ±10°, scale 50–150%, horizontal flip, Mosaic, Mixup, copy-paste
- **Training (Google Colab, Tesla T4):**
  1. *Phase 1:* 150 epochs max, 640 px, batch 16, lr 0.01 (cosine), early stopping
  2. *Phase 2 (fine-tuning):* 50 epochs, 1280 px, batch 4, lr 0.0005, Mosaic 50%
- **Inference extras:** CLAHE contrast normalization and optional tile inference (4 overlapping tiles merged with NMS at IoU 0.5) to improve small-lesion recall

### Results

| Stage | mAP@0.5 | Precision | Recall |
|-------|---------|-----------|--------|
| Phase 1 (640 px) | 76.4% | 79.1% | 68.5% |
| **Phase 2 (1280 px, final)** | **85.6%** | **85.2%** | **78.6%** |

Additional final-model figures: mAP@0.5:0.95 ≈ 52.6%, best F1 = 0.81 at confidence 0.246, maximum recall 0.91 at threshold ≈ 0.

**Choosing a threshold:** use ~0.20–0.30 when missing a lesion is the main concern (higher recall); use a higher threshold when minimizing false positives matters more.

## Database Schema

**Users**: `id` (PK), `email` (unique), `hashed_password`, `full_name` (nullable), `created_at`
**Detections**: `id` (PK), `user_id` (FK), `image_name`, `num_detections`, `confidence`, `detections_json`, `created_at`

## Getting Started

> Adjust paths and commands to match your repository layout.

### Prerequisites

- Python 3.10+
- Node.js 18+
- Trained weights file `best.pt`

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt

# place best.pt where the app expects it, then:
uvicorn main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open the URL printed by the dev server, register an account, log in, and upload an X-ray.

## Usage

1. Register and sign in.
2. Drag an X-ray (JPEG/PNG) onto the upload zone.
3. Set the confidence threshold.
4. Click **Analyze X-ray**.
5. Review the annotated image and detection table; download it if needed.
6. Find past analyses under **Profile**.

## Limitations & Future Work

- Single class: no distinction between early, moderate, or advanced lesions or between occlusal, interproximal, and root caries
- Single-source dataset with undocumented annotator credentials; relatively small test set
- No patient management or follow-up tracking
- Planned: multi-class lesion staging, larger and better-annotated data, patient tracking

## References

- Ultralytics YOLOv8 · Roboflow Universe · FastAPI · React · Tailwind CSS · SQLAlchemy
- WHO, *Global Oral Health Status Report* (2022)
- See the thesis for the full bibliography

