# image-resize-lambda
Image Resizing AWS Lambda using Smartcrop.js 

## Setup Instructions

### Setup node

1. Install NVM

        curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.8/install.sh | bash

1. Open new terminal window (To source the new scripts added in .bash_profile) and cd to the root of the project and run

        nvm install    # this will install the required node version

1. Install node modules

        npm install


### Setup env variables.

The project should directly run with default values for the local environment if you need to setup the specific environment 
variables create a copy of .env.sample with name .env and replace the values.


### Start running project

1. Move to the main directory and make sure correct node version is active.

        nvm use
        
1. Start the server 

        node server.js
        
1. Add one of the images in the input folder with a name/directory 'abc/xyz.jpeg'

1. This can be cropped and accessed using the url. 

        localhost:3000/images/200x200/smartcrop/abc/xyz.jpeg
        localhost:<port>/image/<width>x<height>/smartcrop/<path_in_inputdir>
