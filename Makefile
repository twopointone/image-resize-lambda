.PHONY: all image package dist clean

all: package

image:
	docker build --tag amazonlinux:nodejs .

package: image
	mkdir -p dist/build && cp -r app index.js config.js package.json .env dist/build/
	docker run --rm --volume ${PWD}/dist/build:/build amazonlinux:nodejs npm install --production

dist: package
	mkdir -p dist/lambda-package
	cd dist/build && zip -FS -q -r ../lambda-package/lambda-package.zip *

clean_dist:
	rm -r dist

clean: clean_dist
	docker rmi --force amazonlinux:nodejs