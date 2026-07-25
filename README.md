# VoxelBingo

Interface web de gestion de grilles de Bingo Minecraft, couplée à un plugin Bukkit 1.21.4.

## Fonctionnalités

- **Authentification** — inscription, connexion par pseudo ou email, gestion du profil
- **Grilles de Bingo** — création, modification et suppression de grilles 5x5
- **Saisie guidée** — autocomplete sur 1000+ items, mobs, biomes et succès Minecraft 1.21.4 (format Bukkit)
- **Icônes Minecraft** — affichage automatique des icônes pour chaque case
- **Token plugin** — génération d'un token d'authentification pour le plugin Minecraft
- **API REST** — endpoint `/api/plugin/grilles` consommable par le plugin via header `X-Plugin-Token`

## Stack technique

| Couche | Technologie |
|---|---|
| Frontend | Next.js 16 (React, TypeScript) |
| Backend | Flask (Python 3.11) |
| Base de données | PostgreSQL 15 |
| Déploiement | Docker + Docker Compose |
| Accès distant | Tailscale VPN |

## Prérequis

- Docker et Docker Compose installés
- Tailscale installé et configuré (pour l'accès distant)
- Node.js 20+ (développement local uniquement)
- Python 3.11+ (développement local uniquement)

## Installation

### 1. Cloner le dépôt

```bash
git clone https://github.com/kategaia/Projet_CDA.git
cd Projet_CDA
```

### 2. Configurer les variables d'environnement

Créer le fichier `backend/.env` :

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5433/DB_NAME
SECRET_KEY=votre_cle_secrete_longue_et_aleatoire
```

### 3. Lancer la base de données (si non existante)

```bash
mkdir ~/voxelbingo-db && cd ~/voxelbingo-db
cat > docker-compose.yml << 'DBEOF'
services:
  db:
    image: postgres:15-alpine
    restart: always
    environment:
      POSTGRES_DB: voxelbingo
      POSTGRES_USER: voxeluser
      POSTGRES_PASSWORD: votremotdepasse
    ports:
      - "5433:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
volumes:
  postgres_data:
DBEOF
docker compose up -d
```

### 4. Lancer l'application

```bash
cd Projet_CDA
docker compose up --build -d
```

L'application est accessible sur :
- **Frontend** → `http://localhost:3000`
- **API** → `http://localhost:5000`

## Développement local

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows : .venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Variables d'environnement frontend

Créer `frontend/.env.local` :

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## Tests

### Backend (pytest)

```bash
cd backend
pip install pytest pytest-cov
pytest tests/ -v
```

### Frontend (vitest)

```bash
cd frontend
npm run test
```

## Structure du projet

```
Projet-CDA/
├── backend/
│   ├── app.py              # Point d'entrée Flask (Application Factory)
│   ├── extensions.py       # Extensions Flask (db, bcrypt)
│   ├── utils.py            # Décorateur @token_required
│   ├── models/             # Modèles SQLAlchemy
│   │   ├── user.py
│   │   ├── grille.py
│   │   └── token.py
│   ├── routes/             # Blueprints Flask
│   │   ├── auth.py         # /api/register, /api/login
│   │   ├── grilles.py      # /api/grilles
│   │   ├── profil.py       # /api/profil
│   │   ├── token.py        # /api/token
│   │   └── plugin.py       # /api/plugin/grilles
│   ├── tests/              # Tests pytest
│   └── requirements.txt
├── frontend/
│   ├── app/                # Pages Next.js (App Router)
│   │   ├── login/
│   │   ├── register/
│   │   ├── dashboard/
│   │   ├── profil/
│   │   └── grilles/
│   │       ├── new/
│   │       └── [id]/
│   ├── lib/                # Utilitaires partagés
│   │   ├── minecraftIcons.ts
│   │   ├── minecraftData.ts
│   │   ├── bukkitItems.json
│   │   ├── bukkitMobs.json
│   │   ├── minecraftBiomes.json
│   │   └── minecraftAdvancements.json
│   ├── public/             # Assets statiques
│   └── __tests__/          # Tests vitest
├── .github/
│   └── workflows/
│       └── ci-cd.yml       # Pipeline CI/CD GitHub Actions
└── docker-compose.yml
```

## API — Routes principales

| Méthode | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/register` | — | Créer un compte |
| POST | `/api/login` | — | Se connecter |
| GET | `/api/profil` | JWT | Récupérer son profil |
| PUT | `/api/profil` | JWT | Modifier son profil |
| GET | `/api/grilles` | JWT | Lister ses grilles |
| POST | `/api/grilles` | JWT | Créer une grille |
| GET | `/api/grilles/<id>` | JWT | Récupérer une grille |
| PUT | `/api/grilles/<id>` | JWT | Modifier une grille |
| DELETE | `/api/grilles/<id>` | JWT | Supprimer une grille |
| POST | `/api/token/generate` | JWT | Générer un token plugin |
| GET | `/api/plugin/grilles` | Token | Grilles pour le plugin |

## Format des cases

Chaque case de la grille est stockée en JSONB au format suivant, compatible avec l'API Bukkit 1.21.4 :

```json
{
  "type": "OBTENIR",
  "cible": "DIAMOND",
  "quantite": 32
}
```

Types disponibles : `OBTENIR`, `TUER`, `CRAFTER`, `TROUVER`, `SUCCES`

## Licence

Projet réalisé dans le cadre de la certification CDA (Concepteur Développeur d'Applications) — École Hexagone 2026.