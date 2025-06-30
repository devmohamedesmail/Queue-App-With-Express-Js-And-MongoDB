
import connectDB from "../../config/db.js"
import Place from "../../models/Place.js";
import User from "../../models/User.js"
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Queue from "../../models/Queue.js";
import i18n from 'i18n';
import Role from "../../models/Role.js";

// ********************************* Register User **********************************
export const register_user = async (req, res) => {
    try {
        await connectDB();
        const { name, email, password } = req.body;


        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ status: 400, message: "Email already exists" });
        } else {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);


            const newUser = new User()
            newUser.name = name
            newUser.email = email
            newUser.password = hashedPassword

            await newUser.save()

            const role = new Role();
            role.user_id = newUser._id;
            role.role = "user";
            await role.save();

            const token = jwt.sign(
                { id: newUser._id },
                process.env.JWT_SECRET,
                { expiresIn: "7d" }
            );

            // Set token as a cookie or in local storage
            res.cookie("auth_token", token, {
                httpOnly: true, // Secure the cookie from JS access
                secure: process.env.NODE_ENV === "production",
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });

            req.session.user = {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
                placeId: newUser.place,
            };

            res.redirect('/');
        }



    } catch (error) {
        console.log(error)
        res.status(500).json({
            status: 500,
            message: error.message
        })
    }
}


// ********************************* Login User *************************************
export const login_user = async (req, res) => {
    try {
        await connectDB();
        const { email, password } = req.body;
        // ***************** Form validation section ****************
        if (!email || !password) {
            const errors = ["Email and password are required"];
            return res.render('front/login.ejs', {
                message: "Email and password are required",
                title: "Login",
                errors: errors,
                layout: "layouts/front.ejs",
            })
        }

        // search for the user in the database based on the email provided by the userا
        const user = await User.findOne({ email });
        if (!user) {
            // return res.status(401).json({ status: 401, message: "Invalid email or password" });
            return res.render('front/login.ejs', {
                message: "Invalid email or password",
                title: "Login",
                layout: "layouts/front.ejs",
            })
        }

        // compare the password provided by the user with the password stored in the database
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ status: 401, message: "Invalid email or password" });
        }

        // create token
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );


        // Set token as a cookie or in local storage
        res.cookie("auth_token", token, {
            httpOnly: true, // Secure the cookie from JS access
            secure: process.env.NODE_ENV === "production",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        const place = await Place.findById(user.placeId);

        req.session.user = {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            placeId: user.place,
            place: place
        };

        const places = await Place.find();


        if (user.role === 'admin') {
            req.flash('success', i18n.__('login-success'));
            res.redirect('/admin/index')
        } else if (user.role === 'subscriber' || user.role === 'employee') {
            res.redirect('/subscriber/index')
        } else {
            res.render('front/index.ejs', {
                places: places,
                title: "Home Page",
                layout: "layouts/front",
            })
        }

    } catch (error) {
        res.render('front/login.ejs', {
            layout: "layouts/front",
            title: "Login",
            message: error.message
        })
    }
}





// ********************************* Logout User *************************************
export const logout_user = async (req, res) => {
    try {

        req.session.destroy((err) => {
            if (err) {
                console.log("Error destroying session:", err);
                return res.status(500).json({ status: 500, message: "Something went wrong during logout." });
            }

            res.clearCookie("auth_token");
            res.clearCookie("user_data");

            return res.render('front/login.ejs', {
                message: "User logged out successfully",
                title: "Login",
                layout: "layouts/front.ejs",
            });


        });
    } catch (error) {
        console.log("Logout error:", error);
        res.status(500).json({ status: 500, message: "Something went wrong." });
    }
}

// Delete User
export const delete_user = async (req, res) => {
    try {
        const users = User.find()
        const id = req.params.id;
        await User.findByIdAndDelete(id);
        res.render('admin/users', {
            users: users
        })
    } catch (error) {

    }
}




