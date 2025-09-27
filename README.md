# Ti-Albert Werewolf Party Game

A full-stack web application for playing the classic Werewolf (Mafia) party game with friends locally. Built with React frontend and Node.js + Socket.IO backend for real-time multiplayer experience.

## Features

- **Mobile-First Design**: Optimized for smartphones and tablets
- **Real-Time Multiplayer**: Uses Socket.IO for instant updates
- **QR Code Join**: Easy joining via QR code scan
- **Custom Roles**: Traditional Werewolf with themed character names
- **Moderator Controls**: Dedicated interface for game management
- **Local Network Play**: Perfect for house parties and gatherings

## Game Roles

### Werewolf Team
- **Ti Albert**: The werewolves who eliminate villagers at night

### Villager Team
- **Vilazwas**: Regular villagers who vote during the day
- **Bhai looké**: The Seer - can see one player's role each night
- **Cliffeurd**: The Doctor - can protect one player each night
- **Agwa**: The Bodyguard - can protect players during day phase
- **Longanis**: The Hunter - can eliminate someone when eliminated
- **Tifi**: The Witch - has save and kill potions
- **Sefvilaz**: The Mayor - vote counts double

### Neutral
- **Voler**: The Thief - can steal roles from other players

## Requirements

- **Node.js** (version 16 or higher)
- **npm** (comes with Node.js)
- All devices must be on the same WiFi network

## Installation & Setup

### 1. Clone or Download
```bash
git clone <repository-url>
cd Ti-Albert
```

### 2. Install Backend Dependencies
```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

## Running the Game

### Method 1: Development Mode (Recommended for setup)

**Terminal 1 - Start Backend:**
```bash
cd backend
npm run dev
```
The server will start on `http://localhost:3001`

**Terminal 2 - Start Frontend:**
```bash
cd frontend
npm start
```
The React app will start on `http://localhost:3000`

### Method 2: Production Mode

**Build Frontend:**
```bash
cd frontend
npm run build
```

**Start Backend (serves both frontend and backend):**
```bash
cd backend
NODE_ENV=production npm start
```
The complete app will be available on `http://localhost:3001`

## How to Play

### 1. Setup Game
1. On the host device, navigate to the app
2. Select "Werewolf" from the main menu
3. Configure:
   - Number of players (4-15)
   - Number of Ti Albert (werewolves)
   - Special roles to include
4. Click "Start Game Setup"

### 2. Players Join
- **Option A**: Scan the QR code shown on setup page
- **Option B**: Navigate to the displayed URL on each device
- Each player enters their name
- **Moderator**: One person should enter "moderator" as their name

### 3. Start Game
1. Moderator waits for all players to join
2. Click "Assign Roles" when everyone is connected
3. Each player will see their role privately
4. Moderator can see all role assignments

### 4. Play the Game
- The app handles role distribution
- Use traditional Werewolf rules for gameplay
- Moderator manages the game flow manually
- Reset game anytime to play again

## Game Flow (Traditional Rules)

1. **Night Phase**: 
   - Werewolves (Ti Albert) choose a victim
   - Special roles use their abilities

2. **Day Phase**:
   - Discussion and voting
   - Eliminate suspected werewolf
   - Special roles may act

3. **Win Conditions**:
   - **Villagers win**: Eliminate all werewolves
   - **Werewolves win**: Equal or outnumber villagers

## Network Configuration

### Finding Your Local IP
The app automatically detects and displays your local IP address. Players on the same WiFi network can join using:
- `http://[YOUR-IP]:3000` (development)
- `http://[YOUR-IP]:3001` (production)

### Troubleshooting Network Issues

**Can't connect to server:**
1. Ensure all devices are on the same WiFi network
2. Check if firewall is blocking the ports
3. Try using the host computer's IP address directly

**QR code not working:**
1. Make sure camera permissions are enabled
2. Try entering the URL manually
3. Check if the URL in QR code is correct

## Customization

### Adding New Roles
Edit `backend/server.js` and add new roles to the `ROLES` object:

```javascript
'New Role Name': {
  name: 'New Role Name',
  description: 'Role description here',
  team: 'villager' // or 'werewolf' or 'neutral'
}
```

### Changing Player Limits
Modify the player count limits in `frontend/src/components/WerewolfSetup.js`:

```javascript
// Change maximum players
{Array.from({ length: 20 }, (_, i) => i + 4).map(num => (
  <option key={num} value={num}>{num} players</option>
))}
```

## Project Structure

```
Ti-Albert/
├── backend/
│   ├── package.json
│   └── server.js          # Express + Socket.IO server
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── MainMenu.js
│   │   │   ├── WerewolfSetup.js
│   │   │   └── JoinGame.js
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   └── package.json
└── README.md
```

## Future Enhancements

The app is designed to support multiple games:
- Additional party games (Mafia, Codenames, Secret Hitler)
- Timer functionality
- Vote tracking
- Game statistics
- Role-specific night actions

## Troubleshooting

### Common Issues

**"Name already taken" error:**
- Each player needs a unique name
- Moderator name is reserved

**Role assignment fails:**
- Check player count matches setup
- Ensure moderator is connected
- Verify total roles don't exceed player count

**Players can't join:**
- Confirm all devices on same network
- Check URL/QR code is correct
- Try refreshing the page

**Game doesn't start:**
- Make sure moderator has joined
- Check all required players have joined
- Verify game configuration is valid

### Development

**Hot reload not working:**
```bash
# Restart both frontend and backend
npm run dev
```

**Build errors:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## License

MIT License - Feel free to modify and distribute for personal use.

## Credits

Created for house party entertainment. Inspired by the classic Werewolf/Mafia social deduction game.

---

**Have fun and enjoy your game night! 🐺🌙**