import jwt from "jsonwebtoken";

export function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) return res.status(401).json({ message: "Access denied" });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    req.user = user;
    next();
  });
}













// import jwt from "jsonwebtoken";

// export const protect = (req, res, next) => {
//     try {
//         // التحقق مما إذا كانت بيانات المستخدم موجودة في الجلسة
//         if (!req.session.user) {
//             // إذا لم يكن المستخدم موجودًا في الجلسة، إعادة توجيه المستخدم إلى صفحة تسجيل الدخول
//             return res.render('front/login',{
//                 message: "Session expired, please login again",
//                 layout: "layouts/front",
//                 title: "Login",
//             });
//         }

        
//         req.user = req.session.user;

       
//         next();
        
//     } catch (error) {
//         console.log("Session verification failed:", error);
//         return res.send(error);
//     }
// };
