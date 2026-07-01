# ResumeProof: The Trust Layer for Technical Hiring 

Welcome to the root of **ResumeProof** — a highly scalable, AI-powered ecosystem designed to eliminate hallucinated resumes and automatically verify a candidate's actual engineering capabilities through their GitHub footprint.

This is the master overview of the project's ideation, architecture, tech stack, and deployment strategy.

---

## 🎯 Ideation & Goals

### The Problem
The technical hiring market is flooded with AI-generated resumes. Candidates frequently claim expertise in languages or frameworks they have never used in production. Recruiters and hiring managers spend countless hours manually cross-referencing resumes with GitHub profiles to see if the candidate actually writes code.

### The Solution: ResumeProof
ResumeProof acts as an automated, deterministic verification layer. 
Instead of trusting a PDF, our system ingests a candidate's resume and their GitHub URL. We parse the resume, extract the claimed skills, clone their actual GitHub repositories, and use AI (LangGraph + LLaMA3 via Groq) to analyze the commit history. 

**Our Objective:** Return a deterministic `confidenceScore` and a set of `flags` that tell the hiring manager if the candidate *actually* built the projects they claim, or if they simply forked them.

---

## 🧩 The Ecosystem (System Architecture)

ResumeProof is not a single monolith. It is a distributed ecosystem consisting of four primary components:

### 1. Microservice 1 (MS1): The Gateway & API
**The Bouncer and the Traffic Controller.** 
MS1 is the public-facing REST API. It handles client authentication, API key generation, rate limiting, and webhook management. When a client submits a verification request, MS1 validates the PDF, securely saves the transaction to an AWS RDS PostgreSQL database, and pushes the job onto a Redis queue (BullMQ) so the API can return an immediate `202 Accepted` to the client.
- **Tech Stack:** Node.js, Express, TypeScript, Prisma (ORM), BullMQ, Zod.

### 2. Microservice 2 (MS2): The AI Brain
**The Dark Room.**
MS2 is the background worker. It has no public endpoints. It listens to the Redis queue, picks up jobs, and orchestrates the heavy lifting. It clones the candidate's GitHub repositories, compares the codebase against the parsed resume, and runs a complex AI agent workflow to determine authorship and skill alignment. Once finished, it updates the database and triggers the webhook delivery mechanism back in MS1.
- **Tech Stack:** Python, FastAPI (for internal scaffolding), LangGraph, LangChain, Groq (LLaMA3), PyGithub.

### 3. The Docs Portal & Admin Dashboard
**The Developer's Control Center.**
A sleek, public-facing website where B2B clients (companies integrating our API) go to read our beautiful API documentation. Once they log in, it transforms into an admin dashboard where they can generate API keys, view their quota usage, configure webhook URLs, and copy their signing secrets.
- **Tech Stack:** Next.js 14 (App Router), React 18, Tailwind CSS, Axios.

### 4. The Hiring Portal (Demo/Client UI)
**The Recruiter's View.**
This is a demonstration of how a company might integrate ResumeProof into their own HR software (like Lever or Greenhouse). Recruiters can view a list of candidates, see their ResumeProof `confidenceScore` at a glance, and click in to see the detailed flags (e.g., "Candidate claims 5 years of React, but first React commit was 2 months ago").
- **Tech Stack:** Next.js, React, Tailwind CSS.

---

## 🔄 The Workflow (How they connect)

1. **Integration:** A company uses the **Docs Portal** to create an account and generate an API key. They set up a webhook URL in the dashboard.
2. **Submission:** A candidate applies for a job on the company's website. The company's backend sends the candidate's PDF and GitHub URL to **MS1** via the API.
3. **Queueing:** **MS1** accepts the payload, logs it in PostgreSQL, and enqueues it in Redis.
4. **Processing:** **MS2** pulls the job from Redis, analyzes the GitHub repos via LangGraph, calculates the score, and saves the `Result` to PostgreSQL.
5. **Delivery:** **MS2** signals completion. The webhook dispatcher fires an HTTP POST containing the AI analysis back to the company's webhook URL.
6. **Review:** The recruiter opens their ATS (simulated by our **Hiring Portal**) and instantly sees the verified ResumeProof score next to the candidate's name.

---

## ☁️ Hosting & Deployment

The entire ecosystem is designed to run efficiently on AWS infrastructure, minimizing latency and maximizing security.

### 1. Database Layer (AWS RDS & ElastiCache)
- **PostgreSQL (AWS RDS):** The central source of truth for MS1, MS2, and the Docs Portal. It holds client data, API keys, and transaction states. It is kept private within an AWS VPC.
- **Redis (AWS ElastiCache or Local Docker):** Manages the BullMQ job queues connecting MS1 and MS2.

### 2. Application Layer (AWS EC2 & PM2)
The applications are hosted on an **Ubuntu AWS EC2 instance**. We use **PM2** (Process Manager 2) to keep the services alive, restart them on failure, and manage logs.

- **MS1:** Runs natively via Node.js under PM2 (`pm2 start npm --name "ms1" -- run start`).
- **MS2:** Runs via Uvicorn within a Python virtual environment, managed by PM2 or a background shell script (`start.sh`).
- **Docs Portal / Hiring Portal:** Built Next.js apps running natively on the EC2 instance via PM2. 

*Note: Because the Next.js portals are hosted on the exact same EC2 instance as the microservices, they can securely connect to the RDS database without incurring AWS Data Transfer Out fees.*

---

## 📚 Further Reading

To dive deeper into the specific components, check out our cinematic deep-dive documentation:
- [Behind the Curtain: The Docs Portal & Dashboard](./README_DocsPortal.md)
- [The Odyssey of a Candidate: MS2 AI Architecture](./README_MS2.md)
- [From Stranger to Star: Developer Integration](./README_Integration.md)
- [Testing the Odyssey: Postman QA Guide](./README_Postman.md)
