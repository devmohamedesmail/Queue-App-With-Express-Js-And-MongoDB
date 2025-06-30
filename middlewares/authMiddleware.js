import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {
    try {
        // التحقق مما إذا كانت بيانات المستخدم موجودة في الجلسة
        if (!req.session.user) {
            // إذا لم يكن المستخدم موجودًا في الجلسة، إعادة توجيه المستخدم إلى صفحة تسجيل الدخول
            return res.render('front/login',{
                message: "Session expired, please login again",
                layout: "layouts/front",
                title: "Login",
            });
        }

        
        req.user = req.session.user;

       
        next();
        
    } catch (error) {
        console.log("Session verification failed:", error);
        return res.send(error);
    }
};
