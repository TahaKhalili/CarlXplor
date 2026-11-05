const pool = require('./db');

async function testQuery() {
  try{
    const queryText = `
    SELECT
    user_id,
    exploration_percentage,
    ST_AsGeoJSON(explored_area) AS geojson_shape,
    updated_at
    FROM user_exploration
    WHERE user_id = $1;
   `;
  const res = await pool.query(queryText, ['test_student_Josh']);

  console.log(' !!! Query Success :D !!!');
  console.log('User Record:', res.rows[0]);
  console.log('Parsed GeoJSON Shape:', JSON.parse(res.rows[0].geojson_shape));
} catch (err) {
  console.error(' --- Query Failed :o ---', err);
} finally {
  await pool.end();
}
}

testQuery();
