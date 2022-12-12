// src/api.js

// fragments microservice API, defaults to localhost:8080
const apiUrl = process.env.API_URL || 'http://localhost:8080';

function jsonToTable(json) {
  let table="<table><tr>"
  for(let column in json[0]){
    table+=`<th>${column}</th>`
  }
  table+="</tr>"
  json.forEach(elem => {
      table+="<tr>"
      for(let prop in elem){
        table+=`<td>${elem[prop]}</td>`
      }
      table+="</tr>"
  });
  table+=`</table>`;
  return table;
}

function metaToTable(json) {
  let table="<table><tr>"
  for(let prop in json){
    table+=`<th>${prop}</th>`
  }
  table+="</tr>"
  table+="<tr>"
  for(let prop in json){
    table+=`<td>${json[prop]}</td>`
  }
  table+="</tr>"
  table+=`</table>`;
  return table;
}

function arrayToTable(json) {
  let table="<table><tr>"
  table+=`<th>id</th>`;
  table+="</tr>";
  json.forEach(elem => {
      table+="<tr>";
      table+=`<td>${elem}</td>`;
      table+="</tr>";
  });
  table+=`</table>`;
  return table;
}

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

  const resultDisp = document.querySelector('#result');
  resultDisp.textContent = '';
    
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
    resultDisp.innerHTML = expand? jsonToTable(data["fragments"]) :  arrayToTable(data["fragments"]);

  } catch (err) {
    console.error('Unable to call GET /v1/fragment', { err });
    resultDisp.textContent = 'Unable to call GET /v1/fragment';
  }
}

export async function getFragment(user, id, ext) {
  console.log(`Requesting the fragment ${id}...`);

  const dataDisp = document.querySelector('#data');
  const image = document.querySelector('#image');
  dataDisp.textContent = '';
  image.src = '';

  try {
    const res = await fetch(`${apiUrl}/v1/fragments/${id}${ext}`, {
      headers: user.authorizationHeaders(),
    });
    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }

    let data;
    const contentType = res.headers.get('Content-Type');

    if (contentType === 'application/json') {
      data = await res.json();
      dataDisp.innerHTML = JSON.stringify(data, null, 4).replace(/\n( *)/g, function (match, p1) { return '<br>' + '&nbsp;'.repeat(p1.length);});
    } else if (contentType.includes('image')) {
      data = await res.blob();
      const url = URL.createObjectURL(data);
      image.src = url;
    } else if (contentType.includes('html')) {
      data = await res.text();
      dataDisp.innerHTML = data;
    } 
    else {
      data = await res.text();
      dataDisp.textContent = data;
    } 

    console.log('Successfully received fragment data', { data });
  } catch (err) {
    console.error("Unable to call GET /v1/fragments/:id", { err });
    dataDisp.innerHTML = 'Unable to call GET /v1/fragments/:id';
  }
}

export async function getFragmentInfo(user, id) {
  console.log(`Requesting the info of fragment ${id}...`);
  const dataDisp = document.querySelector('#data');
  dataDisp.textContent = '';
  const image = document.querySelector('#image');
  mage.src = '';
  try {
    const res = await fetch(`${apiUrl}/v1/fragments/${id}/info`, {
      headers: user.authorizationHeaders(),
    });
    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    console.log('Successfully received fragment data info', { data });
    dataDisp.innerHTML = metaToTable(data["fragment"]);
  } catch (err) {
    console.error("Unable to call GET /v1/fragments/:id/info", { err });
    dataDisp.innerHTML = "Unable to call GET /v1/fragments/:id/info";
  }
}

export async function postFragment(user, fragment, type) {
  console.log("Creating a new fragment...");
  const dataDisp = document.querySelector('#post-result');
  dataDisp.textContent = '';
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
    dataDisp.textContent = 'Successfully created fragment';
    return data.fragment;
  } catch (err) {
    console.error('Unable to call POST /v1/fragment', { err });
    dataDisp.textContent = 'Unable to call POST /v1/fragment';
    return null;
  }
}

export async function putFragment(user, id, fragment, type) {
  console.log(`Updating the fragment ${id}...`);
  const dataDisp = document.querySelector('#post-result');
  dataDisp.textContent = '';
  try {
    const res = await fetch(`${apiUrl}/v1/fragments/${id}`, {
      method: "PUT",
      headers: user.authorizationHeaders(type),
      body: fragment.buffer,
    });
    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    console.log('Successfully updated fragment data', { data });
    dataDisp.textContent = 'Successfully updated fragment data';
  } catch (err) {
    console.error("Unable to call PUT /v1/fragments/:id");
    dataDisp.textContent = 'Unable to call PUT /v1/fragments/:id';
  }
}

export async function deleteFragment(user, id) {
  console.log(`Deleting the fragment ${id}...`);
  const dataDisp = document.querySelector('#data');
  dataDisp.textContent = '';
  const image = document.querySelector('#image');
  mage.src = '';
  try {
    const res = await fetch(`${apiUrl}/v1/fragments/${id}`, {
      method: "DELETE",
      headers: user.authorizationHeaders(type),
    });
    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    console.log('Successfully deleted fragment');
    console.log(data);
    dataDisp.textContent = 'Successfully deleted fragment';
  } catch (err) {
    console.error("Unable to call DELETE /v1/fragments/:id", { err });
    dataDisp.textContent = 'Unable to call DELETE /v1/fragments/:id';
  }
}