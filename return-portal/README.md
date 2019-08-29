# Return Portal

## How to deploy app and obtain public url for dev purpose
1. copy your `.secret` to this folder (your firebase credential file should in this folder)
2. In `Dockerfile`, change `WORKDIR /usr/src/retur-portal` to your return-portal folder path
3. Setup [Google Run](https://cloud.google.com/run/docs/setup) and install `gcloud`. Your account should already invited as Editor.
4. Install [Docker](https://docs.docker.com/install/)
5. Build image with under this folder
```
docker build . --tag gcr.io/flindel-dev/[IMAGE]
```
6. Push your image to gcloud, (you can [test locally](https://cloud.google.com/run/docs/testing/local) if you want as well)
```
docker push gcr.io/flindel-dev/[IMAGE]
```
7. Deploy your image, follow [here](https://cloud.google.com/run/docs/deploying).
8. You should see your url on Google Run console, copy that and **create a new Revision** with all environment variable in `.env` to deploy config, [detail](https://cloud.google.com/run/docs/configuring/environment-variables)

Your env should look like this
```
GOOGLE_APPLICATION_CREDENTIALS=/usr/src/return-portal/.secret/xxxx    // location in container
API_URL=[url from google run]
APP_PROXY_PREFIX=flindel-returns    //Currently not used, but if you want to set up app proxy, set the prefix here and use this variable in the code
```
When app proxy is used, set APP_PROXY_PREFIX = SubpathOfYourAppProxy (only put subpath here without Subpath prefix), uncomment line 51 `app.setAssetPrefix(APP_PROXY_PREFIX);` in `server.js`

9. When you make changes and want to test, build the image again, push to gcloud and deploy.
