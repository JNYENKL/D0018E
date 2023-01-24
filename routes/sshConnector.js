/*
const mysql = require('mysql2');
const Client = require('ssh2').Client;
const sshClient = new Client();

const dbServer = {
	host: '130.240.207.20',
	port: 3306,
    user: 'root',
    //password: 'BucOpPwcgHSsiVso',
    database: 'D0018E'
}

const tunnelConfig = {
    host: '130.240.207.20',
	port: 26880,
    user: 'karruc-9',
    password: 'BucOpPwcgHSsiVso'
}

const forwardConfig = {
    srcHost: 'localhost', // any valid address
    srcPort: 22, // any valid port
    dstHost: '130.240.207.20', // destination database
    dstPort: '26880' // destination port
};

const SSHDBConnection = new Promise((resolve, reject) => {
    sshClient.on('ready', () => {
        console.log('client ready');
        sshClient.forwardOut(
            forwardConfig.srcHost,
            forwardConfig.srcPort,
            forwardConfig.dstHost,
            forwardConfig.dstPort,
            (err, stream) => {
                if (err){
                    console.log('Err after forwardconfig');
                    reject(err);
                }
                console.log('updateDBServer');
                const updatedDbServer = {
                    ...dbServer,
                    stream
                };
                const connection = mysql.createConnection(updatedDbServer);
                console.log('create con');
                connection.connect((error) => {
                    if (error) {
                        console.log("error---", error);
                        reject(error);
                    }
                    console.log("Connection Successful");
                    resolve(connection);
                });
            });
            console.log('Tunnel');
    }).connect(tunnelConfig);
});

module.exports = SSHDBConnection;
*/