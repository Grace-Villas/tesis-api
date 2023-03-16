const { sequelize } = require('./models');

const DBconnect = async () => {
    await sequelize.authenticate({
        dialectOptions: {
            useUTC: false
        }
    });
    console.log('DB connected.');
}

module.exports = {
    DBconnect
};