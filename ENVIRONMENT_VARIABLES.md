# Vercel Environment Variables Checklist (Option A - MySQL)

Copy these variables into your Vercel Project Settings (**Settings > Environment Variables**).

## Database (MySQL)
| Key | Value | Description |
|---|---|---|
| `DB_HOST` | `dir-express.com` | Your cloud MySQL host |
| `DB_PORT` | `3306` | MySQL port (default 3306) |
| `DB_USER` | `realtor` | Database username |
| `DB_PASSWORD` | `********` | Database password |
| `DB_NAME` | `ptgr-car` | Database name |

## Authentication
| Key | Value | Description |
|---|---|---|
| `JWT_SECRET` | `your_secret_key` | Secret for JWT signing |
| `JWT_EXPIRES_IN` | `7d` | Token expiration |

## AWS S3 (Media Storage)
| Key | Value | Description |
|---|---|---|
| `AWS_ACCESS_KEY_ID` | `AKIAQR5EPCXSAJ4WBGE7` | Your AWS Access Key |
| `AWS_SECRET_ACCESS_KEY` | `********` | Your AWS Secret Key |
| `AWS_REGION` | `us-east-1` | S3 Bucket Region |
| `AWS_BUCKET_NAME` | `ptgr-realstate` | S3 Bucket Name |

## External Services
| Key | Value | Description |
|---|---|---|
| `GEMINI_API_KEY` | `********` | Google Gemini API Key for AI Chat |
| `PAYPAL_CLIENT_ID` | `...` | PayPal Client ID |
| `PAYPAL_CLIENT_SECRET` | `...` | PayPal Secret |

## Application Settings
| Key | Value | Description |
|---|---|---|
| `NODE_ENV` | `production` | Set to production |
| `FRONTEND_URL` | `https://your-frontend.vercel.app` | URL of your deployed frontend |
| `ADMIN_FRONTEND_URL` | `https://your-admin.vercel.app` | URL of your deployed admin panel |

---
**Note**: Ensure your MySQL server (`dir-express.com`) allows connections from Vercel's IP addresses. Since Vercel uses dynamic IPs, you may need to allow `0.0.0.0/0` or use a proxy if your database provider requires IP whitelisting.
