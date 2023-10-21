const commit = process.env.COMMIT_SHA;

async function getCommit() {
  if (!commit) return { sha: "" };
  try {
    const res = await fetch(
      `https://api.github.com/repos/aydrian/itsaydrian.com/commits/${commit}`
    );
    const data = await res.json();
    return {
      author: data.commit.author.name,
      date: data.commit.author.date,
      isDeployCommit: commit === "HEAD" ? "Unknown" : true,
      link: data.html_url,
      message: data.commit.message,
      sha: data.sha
    };
  } catch (error) {
    return `Unable to get git commit info: ${error.message}`;
  }
}

async function go() {
  const buildInfo = {
    buildTime: Date.now(),
    commit: await getCommit()
  };

  const response = await fetch(
    `https://itsaydrian.pages.dev/api/update-content-sha`,
    {
      body: JSON.stringify(buildInfo),
      headers: {
        authorization: `Bearer ${process.env.POST_API_KEY}`
      },
      method: "post"
    }
  );
  if (!response.ok) {
    console.log({ status: response.status, statusText: response.statusText });
    process.exit(1);
  }
  console.log("content sha updated", buildInfo);
  process.exit(0);
}
go();
