const Index = () => (
  <div>
    {post()}
    <p>Sample app using React and Next.js</p>
  </div>
);

const serveo_name = "suus";

function post() {
  const options = {
    method: "post",
    headers: {
      Accept: "application/json, text/plain, */*",
      "Content-Type": "application/json"
    }
  };
  fetch(`https://${serveo_name}.serveo.net/fulserv`, options)
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw Error(response.statusText);
      }
    })
    .then(data => console.log("Data: ", data))
    .catch(error => console.log("error"));
}

export default Index;
