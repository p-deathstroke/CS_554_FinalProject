import "../../App.css";
import React, { useState } from "react";
import ReactModal from "react-modal";
import { useHistory } from "react-router-dom";

//Firebase Functions
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  deleteUser,
} from "firebase/auth";
import { auth } from "./../../config/firebase-config";

//API Function
import { createUser, readUserByEmail } from "./../../utils/api/index";

//Redux
import { useDispatch } from "react-redux";
import actions from "../../actions";

//Firebase Google Signup/Login
const provider = new GoogleAuthProvider();

ReactModal.setAppElement("#root");

function SignupLoginModal(props) {
  const history = useHistory();

  const dispatch = useDispatch();
  const [showModal, setShowModal] = useState(props.isOpen);
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerCwid, setRegisterCwid] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const handleCloseModal = () => {
    setShowModal(true);
    props.handleClose(false);
  };

  const loginForm = async (event) => {
    event.preventDefault();
    try {
      const user = await signInWithEmailAndPassword(
        auth,
        loginEmail,
        loginPassword
      );
      if (user) {
        const getUserFromDb = await readUserByEmail(loginEmail);
        dispatch(
          actions.loginUser(
            user.user.accessToken,
            getUserFromDb.admin,
            getUserFromDb.username,
            getUserFromDb.email,
            getUserFromDb.CWID
          )
        );
        history.push("/createschedule");
      }
    } catch (error) {
      alert("Email and password combination not found.");
      console.log(error.message);
    }
  };

  const signupForm = async (event) => {
    event.preventDefault();
    try {
      const user = await createUserWithEmailAndPassword(
        auth,
        registerEmail,
        registerPassword
      );
      if (user) {
        const addToDb = await createUser(
          registerEmail.split("@")[0],
          registerEmail,
          registerCwid
        );
        dispatch(
          actions.loginUser(
            user.user.accessToken,
            addToDb.admin,
            registerEmail.split("@")[0],
            registerEmail,
            registerCwid
          )
        );
        history.push("/createschedule");
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const forgotPassword = async (event) => {
    event.preventDefault();
    try {
      await sendPasswordResetEmail(auth, loginEmail);
    } catch (error) {
      console.log(error.message);
    }
  };

  const googleLogin = async (event) => {
    event.preventDefault();
    try {
      const user = await signInWithPopup(auth, provider);
      if (user) {
        const getUserFromDb = await readUserByEmail(user.user.email);
        dispatch(
          actions.loginUser(
            user.user.accessToken,
            getUserFromDb.admin,
            getUserFromDb.username,
            getUserFromDb.email,
            getUserFromDb.CWID
          )
        );
        history.push("/createschedule");
      }
    } catch (error) {
      deleteUser(auth.currentUser);
      alert("User must signup first!");
      console.log(error.message);
    }
  };

  let body = null;

  if (props.modal === "login") {
    body = (
      <form className="form" id="login" onSubmit={loginForm}>
        <h2>Log in now to use SIT Scheduler!</h2>
        <div>
          <label htmlFor="email">
            <input
              name="email"
              className="auth"
              id="email"
              type="email"
              placeholder="Enter email"
              required
              onChange={(event) => {
                setLoginEmail(event.target.value);
              }}
            />
          </label>
        </div>
        <br />
        <div>
          <label htmlFor="password">
            <input
              name="password"
              className="auth"
              id="password"
              type="password"
              placeholder="Enter password"
              required
              onChange={(event) => {
                setLoginPassword(event.target.value);
              }}
            />
          </label>
        </div>
        <br />
        <br />
        <button className="modal-button modal-confirm-button" type="submit">
          Log in
        </button>
        <button
          className="modal-button modal-confirm-button"
          onClick={googleLogin}
        >
          Log in with Google
        </button>
        <br />
        <br />
        <button className="modal-button" onClick={forgotPassword}>
          Forgot Password
        </button>
        <button className="modal-button" onClick={handleCloseModal}>
          Cancel
        </button>
      </form>
    );
  } else if (props.modal === "signup") {
    body = (
      <form className="form" id="signup" onSubmit={signupForm}>
        <h2>Register now to use SIT Scheduler!</h2>
        <div>
          <label htmlFor="email">
            <input
              name="email"
              className="auth"
              id="email"
              type="email"
              placeholder="Enter email"
              required
              onChange={(event) => {
                setRegisterEmail(event.target.value);
              }}
            />
          </label>
        </div>
        <br />
        <div>
          <label htmlFor="CWID">
            <input
              name="CWID"
              className="auth"
              id="CWID"
              type="number"
              placeholder="Enter CWID"
              required
              onChange={(event) => {
                setRegisterCwid(event.target.value);
              }}
            />
          </label>
        </div>
        <br />
        <div>
          <label htmlFor="password">
            <input
              name="password"
              className="auth"
              id="password"
              type="password"
              placeholder="Enter password"
              required
            />
          </label>
        </div>
        <br />
        <div>
          <label htmlFor="password2">
            <input
              name="password2"
              className="auth"
              id="password2"
              type="password"
              placeholder="Confirm password"
              required
              onChange={(event) => {
                setRegisterPassword(event.target.value);
              }}
            />
          </label>
        </div>
        <br />
        <br />
        <button className="modal-button modal-confirm-button" type="submit">
          Sign up
        </button>
        <button className="modal-button" onClick={handleCloseModal}>
          Cancel
        </button>
      </form>
    );
  }
  return (
    <div>
      <ReactModal
        closeTimeoutMS={500}
        name="signupLoginModal"
        isOpen={showModal}
        contentLabel="Signup Login Modal"
        className="home-modal"
      >
        {body}
      </ReactModal>
    </div>
  );
}

export default SignupLoginModal;