const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface) => {
    // Add car-specific columns if they do not exist
    await queryInterface.addColumn('properties', 'make', {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'Unknown',
    });
    await queryInterface.addColumn('properties', 'model', {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'Unknown',
    });
    await queryInterface.addColumn('properties', 'year', {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: new Date().getFullYear(),
    });
    await queryInterface.addColumn('properties', 'mileage', {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });
    await queryInterface.addColumn('properties', 'transmission', {
      type: DataTypes.ENUM('AUTOMATIC', 'MANUAL', 'CVT', 'SEMI_AUTO'),
      allowNull: false,
      defaultValue: 'AUTOMATIC',
    });
    await queryInterface.addColumn('properties', 'fuel_type', {
      type: DataTypes.ENUM('PETROL', 'DIESEL', 'ELECTRIC', 'HYBRID', 'PLUG_IN_HYBRID'),
      allowNull: false,
      defaultValue: 'PETROL',
    });
    await queryInterface.addColumn('properties', 'color', {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'White',
    });
    await queryInterface.addColumn('properties', 'condition', {
      type: DataTypes.ENUM('NEW', 'USED', 'CERTIFIED_PRE_OWNED'),
      allowNull: false,
      defaultValue: 'USED',
    });
    await queryInterface.addColumn('properties', 'body_type', {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'Sedan',
    });
  },

  down: async (queryInterface) => {
    // Remove the columns added in up()
    await queryInterface.removeColumn('properties', 'make');
    await queryInterface.removeColumn('properties', 'model');
    await queryInterface.removeColumn('properties', 'year');
    await queryInterface.removeColumn('properties', 'mileage');
    await queryInterface.removeColumn('properties', 'transmission');
    await queryInterface.removeColumn('properties', 'fuel_type');
    await queryInterface.removeColumn('properties', 'color');
    await queryInterface.removeColumn('properties', 'condition');
    await queryInterface.removeColumn('properties', 'body_type');
  }
};
