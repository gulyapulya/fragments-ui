// src/api.js

// fragments microservice API, defaults to localhost:8080
const apiUrl = process.env.API_URL || 'http://localhost:8080';

/**
 * Given an authenticated user, request all fragments for this user from the
 * fragments microservice (currently only running locally). We expect a user
 * to have an `idToken` attached, so we can send that along with the request.
 */
export async function getFragments(user, expand=false) {
  let route = `${apiUrl}/v1/fragments`;

  if (expand) {
    console.log("Expand: requesting user fragments data...");
    route += `?expand=1`;
  } else {
    console.log("Requesting user fragments data...");
  }
    
  try {
    const res = await fetch(route, {
      // Generate headers with the proper Authorization bearer token to pass
      headers: user.authorizationHeaders(),
    });
    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    console.log('Got user fragments data', { data });
  } catch (err) {
    console.error('Unable to call GET /v1/fragment', { err });
  }
}

export async function getFragment(user, id) {
  console.log(`Requesting the fragment ${id}...`);
  try {
    const res = await fetch(`${apiUrl}/v1/fragments/${id}`, {
      headers: user.authorizationHeaders(),
    });
    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }
    const data = await res.text();
    console.log('Successfully received fragment data', { data });
  } catch (err) {
    console.error("Unable to call GET /v1/fragments/:id", { err });
  }
}

export async function getFragmentInfo(user, id) {
  console.log(`Requesting the info of fragment ${id}...`);
  try {
    const res = await fetch(`${apiUrl}/v1/fragments/${id}/info`, {
      headers: user.authorizationHeaders(),
    });
    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    console.log('Successfully received fragment data info', { data });
  } catch (err) {
    console.error("Unable to call GET /v1/fragments/:id/info", { err });
  }
}

export async function postFragment(user, fragment, type) {
  console.log("Creating a new fragment...");
  try {
    const res = await fetch(`${apiUrl}/v1/fragments`, {
      method: "POST",
      headers: user.authorizationHeaders(type),
      body: fragment.buffer,
    });
    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    console.log('Successfully created fragment data', { data });
    return data.fragment;
  } catch (err) {
    console.error('Unable to call POST /v1/fragment', { err });
    return null;
  }
}

export async function putFragment(user, id, fragment, type) {
  console.log(`Updating the fragment ${id}...`);
  try {
    const res = await fetch(`${apiUrl}/v1/fragments/${id}`, {
      method: "PUT",
      headers: user.authorizationHeaders(type),
      body: fragment.buffer,
    });

    const data = await res.json();
    console.log('Successfully updated fragment data', { data });
    console.log(data);
  } catch (err) {
    console.error("Unable to call PUT /v1/fragments/:id");
  }
}