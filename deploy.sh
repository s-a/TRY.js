#!/bin/bash
git checkout development
git add .
git commit -am "bump"
git push origin development

git checkout master
git merge development
git push origin development

git checkout gh-pages
git rebase master
git push origin gh-pages

git checkout development