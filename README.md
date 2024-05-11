![diagram-export-11-05-2024-23_44_13](https://github.com/mukul7661/Cloud-deployment-application/assets/130670365/2f1a1983-579d-4bf5-a09c-4dcfbd3762ef)


# Cloud deployment Application

It is a cloud hosting solution for deploying react projects just like vercel.

## Installation

```bash
git clone https://github.com/mukul7661/Cloud-deployment-application
cd Cloud-deployment-application

cd api-server
npm install
npm run dev

cd ../frontend-nextjs
npm install
npm run dev

cd ../s3-reverse-proxy
npm install
npm run dev
```


## To do list

- Git hooks for automati deployments on any commit or PR to main branch.
- Production and preview environments.
- Instant Rollback feature in deployments.
- Custom configuration options.

