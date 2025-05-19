'use strict'

const sqlite = require('sqlite3');

const db = new sqlite.Database('database_test.db', (err) => {
    if (err) throw err;
});

const crypto = require('crypto')


exports.getUserById = (id) =>{
    return new Promise((resolve,reject)=>{
        const sql = 'SELECT * FROM users WHERE id=?';
        db.get(sql,[id],(err,row)=>{
            if(err){
                reject(err);
            }else if (row===undefined){
                resolve({error:'User not found.'})
            }else{
                const usr = {id: row.id, email: row.email, name: row.name, is_admin: row.is_admin};
                resolve(usr);
            }

        });

    });
}

exports.getUser = (email, pass) => {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM users WHERE email=?';
      db.get(sql, [email], (err, row) => {
        if (err) {
          return reject(err);
        } else if (!row) {
          return resolve(false);
        } else {
          // Hash provided password and compare with stored hash
          crypto.scrypt(pass, row.salt, 16, function(err, hashPass) { // 32 hex characters are 16 bits  
            if (err) {
              return reject(err);
            }
            if (!crypto.timingSafeEqual(Buffer.from(row.hash, 'hex'), hashPass)) {
              return resolve(false);
            }
            return resolve({
              id: row.id,
              email: row.email,
              name: row.name,
              is_admin: row.is_admin
            });
          });
        }
      });
    });
  };
  

