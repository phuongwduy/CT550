module.exports = (sequelize, DataTypes) => {
  const Coupon = sequelize.define("Coupon", {
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    discount_type: {
      type: DataTypes.ENUM("percent", "fixed"),
      allowNull: false
    },
    discount_value: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    min_order: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    max_discount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: "coupons", 
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false
  });

  return Coupon;
};
