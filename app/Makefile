all:
	NODE_ENV=production npm run build

watch:
	npm run watch

dev:
	npm run dev

testpattern:
	chromium-browser --use-fake-ui-for-media-stream --use-fake-device-for-media-stream https://plenary.unhangout.io/participate/test-pattern-beta

testpatternlocal:
	chromium-browser --use-fake-ui-for-media-stream --use-fake-device-for-media-stream http://localhost:7777/participate/test-pattern-beta

testfile:
	chromium-browser --use-fake-ui-for-media-stream --use-fake-device-for-media-stream --use-file-for-fake-video-capture=$(HOME)/Downloads/720p50_mobcal_ter.y4m https://plenary.unhangout.io/participate/test-pattern-beta
