const { Pool } = require('pg')

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD

    
})

module.exports = pool

pool.on('connect', () => {

    console.log('✅ Conectado a PostgreSQL')

})

pool.query('SELECT NOW ()', (err, res) =>{

    if(err){
        console.log('❌ Error conectandoo a BD', err)
    }else{
        console.log('✅ Conectado a postgreSQL', res.rows[0])
    }


})