// src/app.js

import { Auth, getUser } from './auth';
import { getUserFragments, postFragment } from './api';

const dragDrop = require("drag-drop");

async function init() {
  // Get our UI elements
  const userSection = document.querySelector('#user');
  const loginBtn = document.querySelector('#login');
  const logoutBtn = document.querySelector('#logout');
  const fragmentSection = document.querySelector("#fragment");
  const postFragmentBtn = document.querySelector("#submit-file");

  // Wire up event handlers to deal with login and logout.
  loginBtn.onclick = () => {
    // Sign-in via the Amazon Cognito Hosted UI (requires redirects), see:
    // https://docs.amplify.aws/lib/auth/advanced/q/platform/js/#identity-pool-federation
    Auth.federatedSignIn();
  };
  logoutBtn.onclick = () => {
    // Sign-out of the Amazon Cognito Hosted UI (requires redirects), see:
    // https://docs.amplify.aws/lib/auth/emailpassword/q/platform/js/#sign-out
    Auth.signOut();
  };

  // See if we're signed in (i.e., we'll have a `user` object)
  const user = await getUser();
  if (!user) {
    // Disable the Logout button
    logoutBtn.disabled = true;
    return;
  }

  // Log the user info for debugging purposes
  console.log({ user });

  // Do an authenticated request to the fragments API server and log the result
  getUserFragments(user);
  
  // Update the UI to welcome the user
  userSection.hidden = false;

  // Show the user's username
  userSection.querySelector('.username').innerText = user.username;

  // Disable the Login button
  loginBtn.disabled = true;

  // Disable the fragment section
  fragmentSection.hidden = false;

  // File upload
  
  let fileData;

  dragDrop("#file", (files) => {
    files.forEach((file) => {
      const reader = new FileReader();
      reader.addEventListener("load", (e) => {
        const arr = new Uint8Array(e.target.result);
        const buffer = new Buffer(arr);

        fileData = { buffer, file };
      });
      reader.addEventListener("error", (err) => {
        console.error("FileReader error" + err);
      });
      reader.readAsArrayBuffer(file);

      document.getElementById("file").textContent = file.name;
    });
  });

  // Post fragment
  postFragmentBtn.onclick = () => {
    console.log("Adding a new fragment: ", fileData);
    postFragment(user, fileData);
  };
}

// Wait for the DOM to be ready, then start the app
addEventListener('DOMContentLoaded', init);