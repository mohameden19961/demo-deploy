# 🚀 Guide de Déploiement — Spring Boot + PostgreSQL + Docker → Render

> Un guide complet depuis la création jusqu'au déploiement en production.  
> Valable pour n'importe quel projet Spring Boot.

---

## Prérequis

Avant de commencer, assure-toi d'avoir installé sur ta machine :

- Java 21 (JDK)
- Maven
- Docker
- Git + GitHub CLI (`gh`)
- Un compte GitHub
- Un compte Supabase (gratuit) → https://supabase.com
- Un compte Render (gratuit) → https://render.com
- Postman (pour tester l'API) → https://www.postman.com

---

## Étape 1 — Créer le projet sur start.spring.io

Accède à https://start.spring.io et configure exactement comme suit :

```
Project    : Maven
Language   : Java
Spring Boot: 3.3.x  (dernière version stable)
Group      : com.example
Artifact   : nom-de-ton-projet
Packaging  : Jar
Java       : 21
```

Dans la section **Add Dependencies**, recherche et ajoute :

- **Spring Web** → pour créer des endpoints REST
- **Spring Data JPA** → pour interagir avec la base de données
- **PostgreSQL Driver** → le driver de connexion PostgreSQL
- **Lombok** → pour réduire le code répétitif (optionnel)

Clique sur **GENERATE**, un fichier `.zip` sera téléchargé.  
Extrais-le dans ton dossier de travail et ouvre un terminal dedans.

---

## Étape 2 — Configurer application.properties

Le fichier `src/main/resources/application.properties` est vide par défaut.  
Remplace son contenu complet par :

```properties
spring.application.name=nom-de-ton-projet

spring.datasource.url=${SPRING_DATASOURCE_URL}
spring.datasource.username=${SPRING_DATASOURCE_USERNAME}
spring.datasource.password=${SPRING_DATASOURCE_PASSWORD}
spring.datasource.driver-class-name=org.postgresql.Driver

spring.jpa.hibernate.ddl-auto=update
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect

server.port=${PORT:8080}
```

> ⚠️ Ne jamais écrire tes credentials directement dans ce fichier. Les valeurs entre `${ }` seront fournies par Render au moment du déploiement.

---

## Étape 3 — Créer le Dockerfile

À la racine du projet (dans le même dossier que `pom.xml`), crée un fichier nommé exactement `Dockerfile` (sans extension) :

```dockerfile
# Étape 1 : Build de l'application
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Étape 2 : Image finale légère
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

> 💡 Le build se fait en deux étapes : la première compile avec Maven, la deuxième crée une image légère qui ne contient que le `.jar` final.

---

## Étape 4 — Pusher le projet sur GitHub

Dans le terminal, à la racine de ton projet, exécute ces commandes dans l'ordre :

```bash
git init
git add .
git commit -m "initial commit"
gh auth login
gh repo create nom-de-ton-projet --public --push --source=.
```

La commande `gh auth login` va t'afficher un code à entrer sur `github.com/login/device` pour authentifier ton compte GitHub.

À la fin, ton projet est disponible sur :
`https://github.com/ton-username/nom-de-ton-projet`

---

## Étape 5 — Créer la base de données sur Supabase

### 5.1 — Créer le projet Supabase

1. Va sur https://supabase.com et connecte-toi avec GitHub
2. Clique **New Organization** → donne un nom → Type : `Personal` → Create
3. Clique **New Project**
4. Remplis :
   - **Project name** : nom de ton projet
   - **Database Password** : clique sur **Generate a password** et **note-le bien**
   - **Region** : `Europe`
5. Clique **Create new project** et attends ~2 minutes

### 5.2 — Récupérer la connection string JDBC

1. Sur le dashboard de ton projet, clique sur le bouton **Connect**
2. Sélectionne l'onglet **Direct** → **Connection string**
3. Dans **Connection Method**, sélectionne **Session pooler** ⚠️ (important !)
4. Dans le dropdown **Type**, sélectionne **JDBC**
5. Copie la connection string qui apparaît — elle ressemble à :

```
jdbc:postgresql://aws-1-eu-north-1.pooler.supabase.com:5432/postgres?user=postgres.xxxxxxxxxxxxxxxxxxxx&password=[YOUR-PASSWORD]
```

> ⚠️ Utilise toujours le **Session pooler** et non la Direct connection.  
> Render Free tier utilise **IPv4 uniquement**, et la connexion directe Supabase utilise **IPv6** ce qui causerait une erreur `Network unreachable`.

### 5.3 — Extraire les 3 valeurs nécessaires

Depuis cette connection string, tu extrais tes 3 variables :

| Variable | Comment l'obtenir |
|----------|-------------------|
| `SPRING_DATASOURCE_URL` | Tout ce qui est avant le `?` → `jdbc:postgresql://aws-1-eu-north-1.pooler.supabase.com:5432/postgres` |
| `SPRING_DATASOURCE_USERNAME` | La valeur de `user=` → `postgres.xxxxxxxxxxxxxxxxxxxx` |
| `SPRING_DATASOURCE_PASSWORD` | Le mot de passe que tu as défini à la création du projet |

---

## Étape 6 — Déployer sur Render

### 6.1 — Créer le Web Service

1. Va sur https://render.com et connecte-toi
2. Clique **+ New** → **Web Service**
3. Connecte ton compte GitHub si ce n'est pas encore fait
4. Sélectionne le repo de ton projet dans la liste
5. Configure le service :

```
Name    : nom-de-ton-projet
Region  : Frankfurt (EU Central)
Branch  : main  (ou master selon ton repo)
Runtime : Docker
Plan    : Free
```

### 6.2 — Ajouter les variables d'environnement

Scroll vers le bas jusqu'à la section **Environment Variables** et ajoute tes 3 variables (extraites à l'étape 5.3) :

| Key | Value |
|-----|-------|
| `SPRING_DATASOURCE_URL` | Ton URL Supabase Session pooler |
| `SPRING_DATASOURCE_USERNAME` | Ton username Supabase |
| `SPRING_DATASOURCE_PASSWORD` | Ton mot de passe Supabase |

### 6.3 — Lancer le déploiement

1. Clique **Create Web Service**
2. Render va build l'image Docker et déployer ton application (~3 à 5 minutes)
3. Attends que le statut passe de `Deploying` à `Live` ✅

> 💡 Ton application sera accessible à l'URL : `https://nom-de-ton-projet.onrender.com`

---

## Étape 7 — Tester l'API avec Postman

### 7.1 — Installer et ouvrir Postman

Télécharge Postman sur https://www.postman.com/downloads et installe-le.

### 7.2 — Créer une Collection

1. Ouvre Postman
2. Clique sur **Collections** → **+** pour créer une nouvelle collection
3. Nomme-la `nom-de-ton-projet API`

### 7.3 — Tester les endpoints

#### GET — Récupérer tous les éléments

1. Clique **+ New Request** dans ta collection
2. Méthode : `GET`
3. URL : `https://nom-de-ton-projet.onrender.com/api/products`
4. Clique **Send**
5. Tu dois recevoir `[]` (liste vide au début) avec le statut `200 OK`

#### POST — Créer un élément

1. Crée une nouvelle requête
2. Méthode : `POST`
3. URL : `https://nom-de-ton-projet.onrender.com/api/products`
4. Clique sur l'onglet **Body** → sélectionne **raw** → format **JSON**
5. Colle ce body :

```json
{
  "name": "Mon produit",
  "price": 49.99
}
```

6. Clique **Send**
7. Tu dois recevoir l'objet créé avec son `id` et le statut `200 OK`

#### GET — Vérifier que l'élément est bien enregistré

1. Refais la requête GET de tout à l'heure
2. Tu dois maintenant voir ton produit dans la liste

#### PUT — Modifier un élément

1. Méthode : `PUT`
2. URL : `https://nom-de-ton-projet.onrender.com/api/products/1`
3. Body → raw → JSON :

```json
{
  "name": "Produit modifié",
  "price": 79.99
}
```

4. Clique **Send**

#### DELETE — Supprimer un élément

1. Méthode : `DELETE`
2. URL : `https://nom-de-ton-projet.onrender.com/api/products/1`
3. Clique **Send**
4. Tu dois recevoir le statut `200 OK`

> ⚠️ Sur le plan gratuit de Render, le service s'endort après 15 minutes d'inactivité. La première requête après une pause peut prendre ~30 secondes.

---

## Problèmes fréquents et solutions

| Erreur | Solution |
|--------|----------|
| `url attribute is not specified` | Les variables d'environnement ne sont pas lues. Vérifie que les noms sont exactement `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD`. |
| `Failed to determine driver class` | Le fichier `application.properties` n'est pas correctement configuré. Vérifie que toutes les lignes sont présentes. |
| `Network unreachable / SocketException` | Tu utilises la connexion **Direct** de Supabase (IPv6). Va dans Connect → Direct → **Session pooler** pour obtenir une URL IPv4. |
| `Cannot have more than one free database` | Render ne permet qu'une seule DB gratuite. Utilise Supabase comme base externe. |
| `Build failed sur Render` | Le Dockerfile est introuvable. Vérifie qu'il est à la racine du projet, au même niveau que `pom.xml`. |
| `Unable to determine Dialect` | Assure-toi que la ligne `spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect` est dans `application.properties`. |

---

## ✅ Checklist avant de déployer

- [ ] `application.properties` utilise `${SPRING_DATASOURCE_URL}` et non une URL en dur
- [ ] Le `Dockerfile` est à la racine du projet (même niveau que `pom.xml`)
- [ ] Le projet est bien pushé sur GitHub (branche `main` ou `master`)
- [ ] La connection string Supabase utilisée est celle du **Session pooler** (pas Direct)
- [ ] Les 3 variables `SPRING_DATASOURCE_*` sont ajoutées dans Render → Environment
- [ ] Le Runtime sélectionné sur Render est **Docker**
- [ ] La région Render est la même que celle de la base de données

---

*SUPNUM · Institut Supérieur du Numérique · Nouakchott · 2026*