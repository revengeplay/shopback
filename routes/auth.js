const router = require("express").Router();
const User = require("../models/User");
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");

// REGISTER
router.post("/register", async (req, res) => {
  const newUser = new User({
    username: req.body.username,
    email: req.body.email,
    password: CryptoJS.AES.encrypt(
      req.body.password,
      process.env.PASS_SEC
    ).toString(),
  });

  try {
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (err) {
    res.status(500).json(err);
  }
});

//LOGIN

router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });
    !user && res.status(401).json("Wrong credentials!");

    const hashedPassword = CryptoJS.AES.decrypt(
      user.password,
      process.env.PASS_SEC
    );
    const OriginalPassword = hashedPassword.toString(CryptoJS.enc.Utf8);

    OriginalPassword !== req.body.password &&
      res.status(401).json("Wrong credentials!");

    const accessToken = jwt.sign(
      {
        id: user._id,
        isAdmin: user.isAdmin,
      },
      process.env.JWT_SEC,
      { expiresIn: "3d" }
    );

    const { password, ...others } = user._doc;

    res.status(200).json({ ...others, accessToken });
  } catch (err) {
    res.status(500).json(err);
  }
});

// // Login
// router.post("/login", async (req, res) => {
//   try {
//     const userInfo = await User.findOne({ username: req.body.username });
//     !userInfo && res.status(401).json("Wrong credentials!");

//     const hashedPassword = CryptoJS.AES.decrypt(
//       userInfo.password,
//       process.env.PASS_SEC
//     );
//     const Originalpassword = hashedPassword.toString(CryptoJS.enc.Utf8);

//     Originalpassword !== req.body.password &&
//       res.status(401).json("Wrong credentials!");

//     if (!userInfo) {
//       res.status(403).json("Not Authorized");
//     } else if (userInfo.isAdmin == true) {
//       try {
//         // admin access Token 발급
//         const accessToken = jwt.sign(
//           {
//             id: userInfo.id,
//             username: userInfo.username,
//             email: userInfo.email,
//           },
//           process.env.JWT_ADMIN_SEC,
//           {
//             expiresIn: "1m",
//             issuer: "rplay",
//           }
//         );

//         // admin refresh Token 발급
//         const refreshToken = jwt.sign(
//           {
//             id: userInfo.id,
//             username: userInfo.username,
//             email: userInfo.email,
//           },
//           process.env.REPRESH_ADMIN_SEC,
//           {
//             expiresIn: "24h",
//             issuer: "About Tech",
//           }
//         );

//         // token을 쿠키에 담아 전송
//         res.cookie("accessToken", accessToken, {
//           secure: false,
//           httpOnly: true,
//         });

//         res.cookie("refreshToken", refreshToken, {
//           secure: false,
//           httpOnly: true,
//         });

//         res.status(200).json("login success");
//       } catch (err) {
//         res.status(500).json(err);
//       }
//     } else {
//       try {
//         // user access Token 발급
//         const accessToken = jwt.sign(
//           {
//             id: userInfo.id,
//             username: userInfo.username,
//             email: userInfo.email,
//           },
//           process.env.JWT_USER_SEC,
//           {
//             expiresIn: "1m",
//             issuer: "rplay",
//           }
//         );

//         // user refresh Token 발급
//         const refreshToken = jwt.sign(
//           {
//             id: userInfo.id,
//             username: userInfo.username,
//             email: userInfo.email,
//           },
//           process.env.REPRESH_USER_SEC,
//           {
//             expiresIn: "24h",
//             issuer: "About Tech",
//           }
//         );

//         // token을 쿠키에 담아 전송
//         res.cookie("accessToken", accessToken, {
//           secure: false,
//           httpOnly: true,
//         });

//         res.cookie("refreshToken", refreshToken, {
//           secure: false,
//           httpOnly: true,
//         });

//         res.status(200).json("login success");
//       } catch (err) {
//         res.status(500).json(err);
//       }
//     }
//   } catch (err) {}
// });

module.exports = router;
