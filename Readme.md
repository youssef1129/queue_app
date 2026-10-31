# Salle d'attente de téléconsultation


Une API (NestJS) et une app mobile (React Native / Expo) pour une salle d'attente de téléconsultation : le patient choisit un motif, rejoint la file, suit sa position en direct, voit quand c'est son tour et peut quitter la file à tout moment.


## Parcours

1. Choisir un motif (liste chargée depuis l'API).
2. Rejoindre la file.
3. Suivre sa position et l'attente estimée, mises à jour automatiquement.
4. Voir un message clair quand c'est son tour (et recevoir une notification locale).
5. Quitter la file avec une confirmation.

## Structure du dépôt

```
queue_app/
├── backend/       API NestJS (Swagger, tests, Dockerfile)
├── mobile-app/    App Expo / React Native / TypeScript
└── .github/workflows/ci.yml
```

## Lancer le projet

### Prérequis

- Node.js 22
- Un téléphone avec Expo Go (ou un émulateur), sur le même Wi-Fi que le PC
- Java uniquement pour regénérer le client API (voir plus bas)

### 1. API

```bash
cd backend
npm install
```

Créer un fichier `backend/.env` (voir `.env.example`) :

```
PORT=7000
AVG_CONSULTATION_MINUTES=5
```

```bash
npm run start:dev
```

- API : http://localhost:7000
- Swagger : http://localhost:7000/docs

La durée moyenne d'une consultation est configurable avec `AVG_CONSULTATION_MINUTES` (5 par défaut).

### 2. App mobile

```bash
cd mobile-app
npm install
```

Créer un fichier `mobile-app/.env` avec l'adresse de l'API. Sur un vrai téléphone, `localhost` ne marche pas, il faut l'IP locale du PC (`ipconfig` sous Windows) :

```
EXPO_PUBLIC_API_URL=http://192.168.x.x:7000
```

```bash
npx expo start
```

Puis scanner le QR code avec Expo Go. Le pare-feu Windows doit autoriser le port 7000. Sur l'émulateur Android, l'adresse est `http://10.0.2.2:7000`.

### 3. Tests

```bash
cd backend && npm test
cd mobile-app && npm test
```

### 4. Docker (API)

```bash
cd backend
docker build -t waiting-room-api .
docker run --rm -p 7000:7000 -e AVG_CONSULTATION_MINUTES=5 waiting-room-api
```

### 5. Regénérer le client API (optionnel)

Le client TypeScript de l'app est généré depuis le contrat OpenAPI de l'API et il est déjà commité. Pour le mettre à jour après une modification de l'API :

```bash
cd backend && npm run export:openapi
cd ../mobile-app && npm run api:generate
```

La génération utilise `openapi-generator-cli`, qui demande Java.

## L'API

| Méthode | Route | Rôle |
|---|---|---|
| GET | `/reasons` | Liste des motifs |
| POST | `/tickets` | Rejoindre la file avec un motif |
| GET | `/tickets` | Lister tous les tickets (route de debug, pratique dans Swagger) |
| GET | `/tickets/:id` | Statut, position, attente estimée |
| GET | `/tickets/:id/stream` | Flux SSE des changements du ticket |
| DELETE | `/tickets/:id` | Quitter la file |

Règles métier :

- 3 statuts : `waiting`, `called`, `cancelled`.
- 3 patients fictifs dans la file au démarrage, donc un nouveau ticket commence en position 4.
- Toutes les 20 secondes, le premier ticket en attente passe en `called` et les suivants avancent d'une place.
- Attente estimée = position x durée moyenne (calculée par l'API).
- Erreurs : `400` motif absent ou inconnu, `404` ticket inconnu, `409` si on quitte un ticket déjà appelé ou annulé.

## Choix techniques

- **NestJS** plutôt qu'Express : Swagger, validation et structure en modules sans tout câbler à la main, et c'est une stack que je maîtrise.
- **Swagger + client généré** : le contrat OpenAPI est la source de vérité. L'app utilise le client et les types générés (`ReasonCode`, `TicketResponseDto`...), donc aucun type écrit à la main pour les échanges avec l'API.
- **Validation** : `class-validator` avec un enum `ReasonCode`, ce qui donne le 400 automatiquement et un enum propre dans Swagger et dans le client.
- **Logique dans le service** : `TicketsService` contient toute la logique (file, position, attente). Le scheduler ne fait qu'appeler `advanceQueue()`. La position et l'attente ne sont pas stockées, elles sont recalculées à chaque réponse, donc tout le monde avance tout seul quand la file bouge.
- **Temps réel avec SSE** : le serveur ne fait que pousser des mises à jour vers l'app, donc un flux à sens unique suffit. SSE est du simple HTTP, intégré à NestJS (`@Sse`), et se reconnecte facilement. Un WebSocket aurait demandé plus de code pour un besoin bidirectionnel que je n'ai pas.
- **Polling en secours** : l'app utilise SSE en priorité (lib `react-native-sse`, car React Native n'a pas `EventSource`). Si le flux tombe, elle bascule sur un rafraîchissement toutes les 10 secondes et retente le flux ensuite.
- **Reprise après fermeture** : l'id du ticket est gardé avec AsyncStorage et retrouvé au lancement. Le serveur reste la source de vérité de l'état du ticket.
- **Une seule dépendance en plus côté app** pour le temps réel (`react-native-sse`), et `openapi-generator-cli` pour le client.

## Gestion des états côté app

- **Chargement** : skeletons au premier chargement, rafraîchissements discrets ensuite (petit indicateur "Mise à jour", sans effacer l'écran).
- **Erreurs** : message en français et bouton "Réessayer" si l'API est coupée ou lente (timeout), sans plantage. Si un rafraîchissement échoue, le dernier état connu reste affiché avec un avertissement.
- **Cas particuliers** : 404 (ticket introuvable, retour au choix du motif en effaçant l'id stocké), 409 (on rafraîchit l'état), 400 à l'inscription.
- **Arrêt propre** : le flux et les timers s'arrêtent quand on quitte l'écran, quand le ticket est `called` ou `cancelled`, et il n'y a pas de requêtes qui se chevauchent.
- **Accessibilité** : libellés pour lecteur d'écran sur les boutons et les cartes.

## Choix faits sur les points ambigus

- `called` et `cancelled` sont des statuts finaux : un ticket appelé reste en mémoire avec ce statut, il n'y a pas de statut "consultation terminée".
- `DELETE /tickets/:id` renvoie le ticket mis à jour (statut `cancelled`) plutôt qu'un 204, c'est plus simple pour l'app.
- Un ticket `called` garde son id stocké, pour qu'en rouvrant l'app on revoie "C'est votre tour". Un bouton permet de revenir au choix du motif.
- La route `GET /tickets` n'était pas demandée, je l'ai ajoutée pour voir la file bouger dans Swagger.

## Tests

- **API** : tests unitaires sur `TicketsService` (position et attente d'un nouveau ticket, avancement de la file et passage en `called`, annulation, 409 sur un ticket déjà appelé ou annulé, 404 sur un id inconnu, flux SSE).
- **App** : tests sur le helper d'erreurs, les hooks (chargement, erreur puis réessai, arrêt du rafraîchissement, 404) et l'affichage de l'erreur à la place du skeleton.

## CI

GitHub Actions (`.github/workflows/ci.yml`) à chaque push : tests et build de l'API, vérification TypeScript et tests de l'app, build de l'image Docker.

## Bonus faits

- Reprise du ticket après fermeture de l'app (AsyncStorage)
- Notification locale quand c'est son tour
- Temps réel sans polling (SSE, avec polling en secours)
- CI GitHub Actions
- Dockerfile pour l'API


## Outils d'IA utilisés

J'ai utilisé **Claude** tout au long du projet, pour :

- discuter des choix (NestJS contre Express, SSE contre WebSocket, génération du client) ;
- écrire et corriger les tests, le Dockerfile et le workflow GitHub Actions ;
