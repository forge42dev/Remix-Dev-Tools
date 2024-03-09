# Setting up your own documentation 🔧

To set up your own docs, after cloning the repo and installing dependencies, you need to do the following:

- Rename the `.env.development` file to `.env` and fill in the required environment variables. The AWS part would be discussed in the deployment section, but
  for now, fill in the `GITHUB_OWNER` and `GITHUB_REPO` variables with your GitHub username and the name of the repo you want to use for storing your docs content (should be your own forked repo!).
- The `GITHUB_TOKEN` variable is a personal access token that would be used to access your repo. You can generate one via your GitHub settings page.
- Delete the `docs` folder. You wouldn't need it and can refer back to this one if you need to.
- You can also go ahead and delete the `funding.yml` file within `.github` folder, although **DON'T** delete the `workflows` folder within the same folder.
- Lastly, create a new `docs` branch. This would serve as the branch where your latest up-to-date docs would be stored. You can do this via the GitHub UI or via the command line:
```bash
git checkout -b docs
```
Plus, github actions are already set up to sync your docs to your repo (`docs` branch), so you don't have to worry about that!

That's about it! Run `npm run dev` to start the app and you should be good to go! Easy, right? 🚀