# 🛡️ Face-Shield: Adversarial Identity Protection Layer
> **Part of the Trilokan Intelligence Protocol**

![Project Banner](https://img.shields.io/badge/Status-Active-success) ![Python](https://img.shields.io/badge/Backend-FastAPI-blue) ![Frontend](https://img.shields.io/badge/Frontend-Next.js_14-black) ![AI](https://img.shields.io/badge/Model-ResNet50-orange)

**"In an age of omnipresent surveillance, invisibility is a human right."**

Face-Shield is a military-grade **Adversarial Attack Engine** designed to interrogate and neutralize deep learning surveillance systems. It utilizes advanced mathematical perturbations (FGSM & PGD) to "cloak" human identities from Computer Vision models without degrading the visual quality of the image for human observers.

---

## 🚨 The Problem
Facial recognition and invasive AI classifiers are trained on billions of public images. They can identify you, track your location, and profile your behavior without consent.

## ⚡ The Solution
Face-Shield generates **Adversarial Examples**—input images with mathematically calculated "noise" layers that are invisible to the naked eye but catastrophic to AI logic.
- **Human View:** Sees a standard selfie.
- **AI View:** Sees a "Toaster," "Goldfish," or "Tibetan Terrier" with 99% confidence.

---

## 📸 Proof of Defenses (Screenshots)

### 1. The "High-Confidence Jailbreak"
*Successfully forcing ResNet50 to misclassify a Human as a "Bikini" with 100% certainty.*
![Main Interface](YOUR_SCREENSHOT_LINK_HERE.png)

### 2. X-Ray Vision (Explainable AI)
*Visualizing the actual pixel-level noise pattern (amplified 10x) used to break the model.*
![X-Ray Mode](YOUR_NOISE_MAP_SCREENSHOT.png)

---

## 🚀 Key Capabilities

### ⚔️ The War Room (Multi-Algorithm Attacks)
Choose your weapon based on the threat level:
- **⚡ FGSM (Fast Gradient Sign Method):** Single-step gradient attack. Fast, efficient, real-time protection.
- **💪 PGD (Projected Gradient Descent):** Iterative, multi-step attack. Computationally expensive but significantly harder to defend against.

### 🎛️ Stealth Slider (Dynamic Epsilon)
Fine-tune the balance between **Privacy** and **Quality**.
- **Low Strength (0.01):** Invisible protection.
- **High Strength (0.10):** Maximum security (visible noise artifacts).

### 🧪 The Robustness Lab
Stress-test your cloak against real-world data loss scenarios. Simulates:
- **WhatsApp Compression (JPEG)**
- **Motion Blur**
- **Social Media Resizing**
*Ensures your identity remains hidden even after image degradation.*

### 📄 Security Certificates
Generates a professional **PDF Audit Report** containing:
- Before/After Analysis.
- Confidence Deltas.
- Cryptographic Timestamp.

---

## 🛠️ Tech Stack

### **Intelligence Layer (Backend)**
- **Framework:** FastAPI (Python 3.10)
- **Core AI:** PyTorch + Torchvision
- **Model:** ResNet50 (Pre-trained on ImageNet-1k)
- **Math:** NumPy, SciPy (Matrix operations)
- **Imaging:** PIL (Pillow), ReportLab (PDF Gen)

### **Interface Layer (Frontend)**
- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS + Framer Motion (Animations)
- **Language:** TypeScript
- **UI Components:** Lucide React

---

## 🔧 Installation & Setup

### Prerequisites
- Python 3.9+
- Node.js 18+

### 1. Ignite the Intelligence Layer (Backend)
```bash
cd face-shield-backend
python -m venv venv
# Windows
.\venv\Scripts\activate
# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt
python main.py
