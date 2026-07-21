CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    candidate_name VARCHAR(255) NOT NULL,
    candidate_email VARCHAR(255) NOT NULL,
    github_url VARCHAR(255) NOT NULL,
    resume_filename VARCHAR(255) NOT NULL,
    transaction_id VARCHAR(255),
    verification_result JSONB,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed Jobs
INSERT INTO jobs (id, title, description, requirements) VALUES 
('c5a8be42-f222-4a0d-8ea7-a36746816823', 'Software Engineer — Backend', 'We are looking for a strong Backend Engineer to join our high-performance infrastructure team. You will be responsible for designing, building, and maintaining scalable RESTful services and highly concurrent data processing pipelines that serve millions of users. You will work closely with frontend engineers, product managers, and data scientists to deliver new features rapidly.', 'Must have extensive experience with Node.js, Express, and PostgreSQL. Proficiency in database design, query optimization, and REST API best practices. Experience with Redis and background job processing (BullMQ/Celery) is highly desired.'),
('42e13200-c976-4dc4-b789-21a4f00438b9', 'Frontend Developer', 'Join our dynamic product team to build the next generation of our user-facing applications. You will be responsible for translating UI/UX designs into high-quality, pixel-perfect code, ensuring maximum performance across a vast array of web-capable devices and browsers.', 'Deep understanding of React.js, TypeScript, and modern state management tools (Zustand/Redux). Strong CSS and responsive design skills. Experience with Next.js and TailwindCSS is a strong plus.'),
('98d249f0-25fc-4277-bc5b-42ea95240c03', 'Data Analyst — Placement Insights', 'We are seeking an analytical and detail-oriented Data Analyst to uncover insights from our massive datasets. You will analyze student placement records, generate complex reports, and create dashboards that drive strategic decisions for our university partners and internal teams.', 'Proficiency in Python, SQL, and data visualization tools (Tableau, PowerBI). Solid understanding of statistics, AB testing, and data modeling. Experience working with unstructured data and basic machine learning concepts is a bonus.'),
('f02a6375-7f61-4e78-b118-2e86fb7b7b13', 'DevOps Engineer', 'We are looking for a DevOps Engineer to automate and streamline our deployment processes, ensuring high availability and reliability of our cloud infrastructure. You will manage container orchestration, CI/CD pipelines, and infrastructure-as-code deployments.', 'Extensive experience with AWS/GCP, Docker, and Kubernetes. Strong scripting skills in Bash or Python. Proven track record managing CI/CD pipelines (GitHub Actions, Jenkins) and IaC tools like Terraform.')
ON CONFLICT (id) DO NOTHING;
