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
        const user=await User.find()

        const currentYear = new Date().getFullYear()
        const yearsToInclude = 4
        const currentMonth = new Date().getMonth()

        const defalutMonthsValues = Array.from({ length: 12 }, (_, i) => ({
            month: i + 1,
            total: 0,
            count: 0,
        }))

        const defaultYearlyValues = Array.from(
            { length: yearsToInclude },
            (_, i) => ({
                year: currentYear - yearsToInclude + i + 1,
                total: 0,
                count: 0,
            })
        );

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
                                
                                    $multiply: ["$Products.total", "$Products.quentity"],

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


        const updatedMonthlyValues = defalutMonthsValues.map((defaultMonth) => {
            const foundMonth = monthlySales.find(
                (monthData) => monthData.month === defaultMonth.month
            );
            return foundMonth || defaultMonth;
        });



        const monthlyUser = await User.aggregate([
            {
                $group: {
                    _id: { $month: "$createdAt" },
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    month: "$_id",
                    count: "$count"
                }
            }
        ]);



        const updatedMonthlyUserCount = defalutMonthsValues.map((defaultMonth) => {
            const foundMonth = monthlyUser.find(
                (monthData) => monthData.month === defaultMonth.month
            );
            return foundMonth || defaultMonth;
        });


        //yearly sales

        const yearlySalesData = await Orders.aggregate([
            {
                $unwind: "$Products"
            },
            {
                $match: {
                    "Products.orderStatus": "delivered",
                    date: { $gte: new Date(currentYear - yearsToInclude, 0, 1) },
                    "Products.orderStatus": { $ne: "cancelled" },

                }
            },
            {
                $group: {
                    _id: { $year: "$date" },
                    total: {
                        $sum: {
                                       $sum: { $multiply: ["$Products.total", "$Products.quentity"] },
                        }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    year: "$_id",
                    total: "$total",
                    count: "$count",
                },
            },
        ])

       



        // Update yearly values based on retrieved data
        const updatedYearlyValues = Array.from(
            { length: yearsToInclude },
            (_, i) => {
                const yearToCheck = currentYear + i;
                const foundYear = yearlySalesData.find(
                    (yearData) => yearData.year === yearToCheck
                );
                return foundYear || { year: yearToCheck, total: 0, count: 0 };
            }
        );

        

        res.render("dashboard", { salesLen, revenue, codRevenue, productlen, categorylen, totalUser, revenuelen, pendlen, updatedMonthlyValues, updatedMonthlyUserCount, updatedYearlyValues,user });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};



//sales report

const salesReport = async (req,res) =>{
    try {
        const moment = require ("moment")

        const firstOrder = await Orders.find().sort({ date : 1})
        const lastOrder = await Orders.find().sort({date : -1})

        const orders = await Orders.find({
            "Products.orderStatus":{ $nin: ["returned", "cancelled"] }
        }).populate({
            path: "Products.productId",
            model: "Products",
          }).populate({
            path: 'user',
            model: 'User'
          })
          .sort({date : -1})

         res.render("salesReport",{
            firstOrder: moment(firstOrder[0].date).format("YYYY-MM-DD"),
            lastOrder: moment(lastOrder[0].date).format("YYYY-MM-DD"),
            orders,
            moment,
         })

    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: 'Internal Server Error' });

    }
}

//date sorting

const dateSort=async (req,res)=>{
    try {
        const {startDate,endDate}=req.body
        const startDateObj=new Date(startDate)
        startDateObj.setHours(0,0,0,0)
        const endDateObj=new Date(endDate)
        endDateObj.setHours(23,59,59,999)

        const selectedDate=await Orders.aggregate([
            {
                $match:{
                    date:{
                        $gte:startDateObj,
                        $lte:endDateObj
                    },
                    
                    "Products.orderStatus":{ $nin: ["returned", "cancelled"] }
                },
            },
      
            {
                $lookup: {
                  from: "users",
                  localField: "user",
                  foreignField: "_id",
                  as: "user",
                }
              },
            {
                $unwind:"$Products"
            },
            {
                $lookup: {
                    from: "Products",
                    localField: "Products.productId",
                    foreignField: "_id",
                    as: "Products.product",
                },
            },

            {
                $unwind:"$Products"
            },
            {
                $group: {
                    _id: "$_id", 
                    user: { $first: "$user" }, 
                    address: { $first: "$address" },
                    order_id: { $first: "$_id" },
                    total:{$first:"$total"},
                    date: { $first: "$date" },
                    paymentMode: { $first: "$paymentMode" },
                    Products: { $push: "$Products" }, 
                },
            },            

        ])

        res.status(200).json(selectedDate);
        console.log("selected",selectedDate)
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}


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
    salesReport,
    dateSort
};
