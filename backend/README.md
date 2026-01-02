# Website Builder Backend API

Backend API for the Website Builder application.

## Tech Stack

- **Framework**: Express.js (Node.js)
- **Database**: MySQL 8.0
- **ORM**: Sequelize
- **Container**: Docker + Docker Compose

## Quick Start

### Using Docker (Recommended)

1. Start the services:

```bash
docker-compose up -d
```

2. Check logs:

```bash
docker-compose logs -f backend
```

3. Stop services:

```bash
docker-compose down
```

### Local Development

1. Install dependencies:

```bash
cd backend
npm install
```

2. Make sure MySQL is running locally

3. Create `.env` file (copy from `.env.example`)

4. Start server:

```bash
npm run dev
```

## API Endpoints

### Pages

- `GET /api/builder/pages` - List all pages
- `GET /api/builder/pages/:id` - Get single page
- `POST /api/builder/pages` - Create new page
- `POST /api/builder/pages/:id` - Update/Save page
- `DELETE /api/builder/pages/:id` - Delete page

### Health Check

- `GET /health` - Server health status

## Database Schema

```sql
CREATE TABLE pages (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  status ENUM('draft', 'published') DEFAULT 'draft',
  editor_data JSON,
  compiled_html LONGTEXT,
  editor_assets JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## Environment Variables

```env
PORT=8000
DB_HOST=mysql
DB_USER=root
DB_PASSWORD=root
DB_NAME=website_builder
DB_PORT=3306
NODE_ENV=development
```

## Initial Data

The server automatically creates 3 initial pages on first run:

- Ana Sayfa (published)
- Hakkımızda (draft)
- İletişim (draft)
