const User = require("../models/userModel");
const Products = require("../models/productModel")
const category = require("../models/categoryModel")
const bcrypt = require("bcrypt");
const Category = require("../models/categoryModel");
const Orders = require("../models/orderModel")

const loadLogin = async (req, res) => {
    try {
        res.render("login");
    } catch (error) {
        console.log(error.message);
    }
};

const verifyLogin = (req, res) => {
    try {
        const email = process.env.adminEmail;
        const password = process.env.adminPassword;
        const name = process.env.adminName;

        if (email == req.body.email && password == req.body.password) {
            req.session.admin = name;
            res.redirect("/admin/dashboard");
        } else {
            const errormsg = "Admin not found";
            req.flash("err", errormsg);
            res.redirect("/admin");
        }
    } catch (error) {
        console.log(error.message);
    }
};

//======================================================================================Admin DashBoard ==========================================================================

const loadDashboard = async (req, res) => {
    try {
        const [categorylen, productlen, totalUser] = await Promise.all([
            Category.countDocuments(),
            Products.countDocuments(),
            User.countDocuments()
        ]);

        const salesDash = await Orders.aggregate([
            {
                $unwind: '$Products'
            },
            {
                $match: { 'Products.orderStatus': { $nin: ["returned", "cancelled"] } }
            },
            {
                $group: {
                    _id: null,
                    count: { $sum: 1 }
                }
            }
        ]);

        let salesLen = salesDash.length > 0 ? salesDash[0].count : 0;
        // console.log("sale", salesLen);

        const revenue = await Orders.aggregate([
            {
                $unwind: "$Products"
            },
            {
                $match: {
                    "Products.orderStatus": { $in: ["delivered", "placed"] },
                    "paymentMode": { $in: ["Razorpay", "wallet"] }
                }
            },
            {
                $group: {
                    _id: null,
                    totalrevenue: { $sum: "$Products.total" }
                }
            }
        ]);
        // console.log("revenue wallet", revenue);

        const codRevenue = await Orders.aggregate([
            {
                $unwind: '$Products'
            },
            {
                $match: {
                    "Products.orderStatus": { $in: ["delivered"] },
                    "paymentMode": { $in: ["Cash on delivery"] }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$Products.total' }
                }
            }
        ]);
        // console.log("Cod", codRevenue);

        const pending = await Orders.aggregate([
            {
                $match: {
                    "Products.orderStatus": { $ne: "delivered" }
                }
            },
            {
                $group: {
                    _id: null,
                    count: { $sum: 1 }
                }
            }
        ]);
        // console.log("pending orders", pending);

        const revenuelen = (revenue.length > 0 ? revenue[0].totalrevenue : 0) + (codRevenue.length > 0 ? codRevenue[0].total : 0);
        // console.log("revenue", revenuelen);

        let pendlen = pending.length > 0 ? pending[0].count : 0;
        // console.log("pen", pendlen);

        //==============Chart DashBoard==================

        //orders

        const currentYear=new Date().getFullYear()
        console.log(currentYear);
        const yearsToInclude=4
        const currentMonth = new Date().getMonth()

        const defalutMonthsValues=Array.from({length:12},(_,i) => ({
            month: i + 1,
            total: 0,
            count: 0,
        }))

          //monthly sales Data

          const monthlySales = await Orders.aggregate([
            {
                $unwind: "$Products",
            },
            {
                $match: {
                    "Products.orderStatus": "delivered",
                    date: { $gte: new Date(currentYear, currentMonth - 1, 1) },
                    "Products.orderStatus": { $ne: "cancelled" },
                },
            },
            {
                $group: {
                    _id: { $month: "$date" },
                    total: {
                        $sum: {
                            $subtract: [
                                {
                                    $multiply: ["$Products.price", "$Products.quentity"],
                                },
                                "$total",
                            ],
                        },
                    },
                    count: { $sum: 1 },
                },
            },
            {
                $project: {
                    _id: 0,
                    month: "$_id",
                    total: "$total",
                    count: "$count",
                },
            },
        ]);
        console.log('monthlySales:',monthlySales);
    
        const updatedMonthlyValues = defalutMonthsValues.map((defaultMonth) => {
            const foundMonth = monthlySales.find(
                (monthData) => monthData.month === defaultMonth.month
            );
            return foundMonth || defaultMonth;
        });
    
        console.log("updateMonthValues", updatedMonthlyValues);
       



        res.render("dashboard", { salesLen, revenue, codRevenue, productlen, categorylen, totalUser, revenuelen, pendlen,updatedMonthlyValues});
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};






//=======================================================================================================

const loadAlluser = async (req, res) => {
    try {
        const userData = await User.find({ is_verified: 1 })
        res.render('alluser', { userData });
    } catch (error) {
        console.log(error.message);
    }
}

const listUnlistUser = async (req, res) => {
    try {
        const id = req.query.id
        const user = await User.findOne({ _id: id })
        if (user) {
            const newStatus = user.status === "Active" ? "Block" : "Active";
            const updatedUser = await User.findByIdAndUpdate(id, { $set: { status: newStatus } }, { new: true })
            const alluser = await User.find();
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');
            res.redirect("/admin/alluser")
        } else {
            res.send("listing and unlisting")
        }
    } catch (error) {
        console.log(error.message);
    }
}

const adminLogout = async (req, res) => {
    try {
        req.session.destroy()
        res.redirect('/admin')
    } catch (error) {
        console.log(error.message);
    }
}


module.exports = {
    loadLogin,
    verifyLogin,
    loadDashboard,
    loadAlluser,
    listUnlistUser,
    adminLogout,
};
