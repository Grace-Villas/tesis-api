const { sequelize } = require('./models');

const DBconnect = async () => {
    await sequelize.authenticate();
    console.log('DB connected.');
}

module.exports = {
    DBconnect
};