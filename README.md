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

        images - manipulation

        localhost:3000/images/size:200x200/extend:b/blur:5.2/type:crop/xyz.jpeg

        localhost:<port>/images/size:<Width>x<Height>/extend:<h/w/b>(optional)/blur:<0.3 - 1000>(optional)/type:<crop/cover/blurredframe>/<path>

        fetching raw files

        localhost:3000/raw/xyz.jpeg

        localhost:<port>/raw/<path>

1. Url dissection

        parameters

        1. processor - image / raw for now
        Processor parameter defines the way I want to process my file.

        2. size - <Width>x<Height>
        Size parameter is the required dimensions with which I want to process my file. You can also input one of the two ie width eg. (100x) or height eg. (x100).

        3. extend - (h/w/b)
        Extend parameter defines the dimensions in which you want to extend your image ie. h for height, w for width and b for base. Its an optional parameter and if not provided the image would not be enlarged above its natural size.

        4. blur - number between 0.3 - 1000
        Blur parameter defines the blur radius with which you want to blur your image. Its also an optional parameter.

        5. type - crop/cover/blurredframe
        Type parameter defines the type of image processing we want to do with our image. This is a required parameter.

        6. path
        The path of your file
