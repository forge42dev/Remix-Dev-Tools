# Deploy your new docs 🚀

To deploy your new docs, firstly, you need to create a new S3 bucket. 

> [!NOTE]
> You need an AWS account for this. If you don't have one, you can create one [here](https://aws.amazon.com/). (💳 Credit card needed - you shouldn't be charged)

After doing so, you want to set up a free-for-all policy. Basically allows anyone with credentials to access your bucket. To do so, go to the bucket's permissions tab and click on `Bucket Policy`. Then, paste the following policy:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "AllowPublicRead",
            "Effect": "Allow",
            "Principal": "*",
            "Action": [
                "s3:GetObject",
                "s3:GetObjectVersion"
            ],
            "Resource": "arn:aws:s3:::<YOUR_BUCKET_NAME>/*"
        }
    ]
}
```

You also need to set bucket's visibility to Private. And in your Access Control List (ACL), tick the `Read` option for the `Everyone` grantee. That way, your bucket is still private but anyone with credentials can access it (I hope).

## Set Up CI/CD

To set up Github Actions for CI/CD, you need to set the following secrets in your repo:

- `AWS_ACCESS_KEY_ID`: Your AWS access key ID
- `AWS_SECRET_ACCESS_KEY`: Your AWS secret access key
- `AWS_ACCESS_KEY_ID`: The name of your S3 bucket

You also want to set workflow permissions to read and write in your actions settings within your repo.

## Deploy to Fly

Unfortunately, at the moment, there is no workflow for deployment to Fly. However, you can easily deploy to Fly by running the following command:
```bash
fly deploy --remote-only
```

> [!CAUTION]
> Make sure to edit the `fly.toml` file to include your own app name and region.
