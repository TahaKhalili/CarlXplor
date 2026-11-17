const express = require('express');
const pool = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse incoming JSON bodies (POST requests)
app.use(express.json());

// 1. Root route
app.get('/', (req, res) => {
  res.send('Welcome to the CarlXplor API!');
});

// 2. Health check route for testing
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'CarlXplor server is running!' });
});

// 3. GET route: Fetch spatial GeoJSON data for a student
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

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User exploration data not found' });
    }

    const userData = result.rows[0];

    res.json({
      userId: userData.user_id,
      explorationPercentage: userData.exploration_percentage,
      exploredArea: JSON.parse(userData.geojson_shape),
      updatedAt: userData.updated_at
    });

  } catch (error) {
    console.error('Error fetching user exploration data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 4. POST route: Receive GPS coordinates and expand explored area via ST_Union
app.post('/api/exploration/:userId/location', async (req, res) => {
  const { userId } = req.params;
  const { latitude, longitude, radius = 20 } = req.body;

  if (!latitude || !longitude) {
    return res.status(400).json({
      error: 'Latitude and longitude are required in request body'
    });
  }

  try {
    const updateQuery = `
      UPDATE user_exploration
      SET
        explored_area = ST_Multi(
          ST_Union(
            COALESCE(
              explored_area,
              ST_SetSRID(ST_GeomFromText('MULTIPOLYGON EMPTY'), 4326)
            ),
            ST_Buffer(
              ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
              $3
            )::geometry
          )
        ),
        updated_at = NOW()
      WHERE user_id = $4
      RETURNING
        user_id,
        exploration_percentage,
        ST_AsGeoJSON(explored_area) AS geojson_shape,
        updated_at;
    `;

    // PostGIS ST_MakePoint takes (longitude, latitude)
    const values = [longitude, latitude, radius, userId];
    const result = await pool.query(updateQuery, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User record not found' });
    }

    const updatedData = result.rows[0];

    res.json({
      message: 'Exploration area expanded successfully',
      userId: updatedData.user_id,
      explorationPercentage: updatedData.exploration_percentage,
      exploredArea: JSON.parse(updatedData.geojson_shape),
      updatedAt: updatedData.updated_at
    });

  } catch (error) {
    console.error('Error updating exploration area:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start listening
app.listen(PORT, '0.0.0.0', () => {
  console.log(`CarlXplor server is running on http://0.0.0.0:${PORT}`);
});