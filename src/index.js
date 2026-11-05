const express = require('express');
const pool = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

//Middleware to parse incoming JSON data in HTTP request
app.use(express.json());

app.get('/', (req,res) => {
    res.send('CarlXplor API!');
})
//Health-check route
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'CarlXplor Server is running!'});
});

app.get('/api/exploration/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const queryText = `
        SELECT
            user_id,
            exploration_percentage,
            ST_AsGeoJSON(explored_area) AS geojson_shape,
            updated_at
        FROM user_exploration
        WHERE user_id = $1;
    `;
    const result = await pool.query(queryText, [userId]);

    if(result.rows.length === 0) {
        return res.status(404).json({ error: 'User exploration data not found'});
    }

    const userData = result.rows[0];

    //Return structured response with parsed GeoJSON
    res.json({
        userId: userData.user_id,
        explorationPercentage: userData.exploration_percentage,
        exploredArea: JSON.parse(userData.geojson_shape),
        updatedAt: userData.updated_at
    });

} catch (error) {
    console.error('Error fetching user exploration data:', error);
    res.status(500).json({ error: 'Internal server error'});
}
});

const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`CarlXplor server is running at http://localhost:${PORT}`)
    console.log(`Local network URL: http://<What's this server's IP address>`)
});

server.on('error', (err) => {
    console.error('Server failed to start:', err.message);
});