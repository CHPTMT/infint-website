# Getting INFINT online: accounts and setup

Do these in order. Use infintco@gmail.com for every sign-up and turn on two-factor login wherever it is offered.

| Step | Service | What it is for | Cost |
|---|---|---|---|
| 1 | GitHub | Stores the website code. Claude Code works on it here. | Free |
| 2 | Cloudflare | Hosts the website, runs the email function, forwards your domain email | Free |
| 3 | Domain registrar (HostAfrica or Truehost) | Buys infint.co.za | About R70 to R120 a year |
| 4 | Resend | Sends the booking form emails, and lets Gmail send as your domain | Free (3,000 emails a month, 100 a day) |
| 5 | Cloudflare Email Routing | hello@infint.co.za lands in your Gmail | Free |

## 1. GitHub

1. Sign up at github.com/signup. The Free plan is enough (unlimited private repositories).
2. Create a new repository: name `infint-website`, set to Private, no README.
3. Upload the contents of `C:\Users\tshed\Pictures\INF JPG\infint-website` (or let Claude Code push it later).

## 2. Cloudflare

1. Sign up at dash.cloudflare.com/sign-up.
2. Workers & Pages > Create > Pages > Connect to Git > pick `infint-website`.
3. Build settings: Framework preset None, Build command empty, Build output directory `/`.
4. Deploy. The site goes live on `infint-website.pages.dev` (or similar).

## 3. Domain

1. Search for `infint.co.za` at HostAfrica or Truehost (both South African, pay in rand). If it is taken, try `infint.africa`, `infintco.co.za` or `infint.photography`.
2. Buy registration only. Skip hosting, email and any add-ons; Cloudflare does all of that for free.
3. In Cloudflare: Add a domain > enter `infint.co.za` > Free plan. Cloudflare gives you two nameservers.
4. Back at the registrar: change the domain's nameservers to the two Cloudflare ones. This can take a few hours.
5. In Cloudflare: your Pages project > Custom domains > add `infint.co.za` and `www.infint.co.za`.

## 4. Resend (form emails)

1. Sign up at resend.com/signup with infintco@gmail.com. Free plan.
2. Domains > Add domain > `infint.co.za`. Resend can add its DNS records to Cloudflare for you, or copy them across by hand.
3. API Keys > Create API key. Copy it once; it is only shown once.
4. In Cloudflare: Pages project > Settings > Variables and secrets, add:
   - `RESEND_API_KEY` (type Secret): the key
   - `NOTIFY_EMAIL`: infintco@gmail.com
   - `FROM_EMAIL`: `INFINT Website <bookings@infint.co.za>`
5. Redeploy, then send a test booking from the live site.

## 5. Your own email address, free

Receiving:
1. Cloudflare > infint.co.za > Email > Email Routing > Enable.
2. Add a route: `hello@infint.co.za` forwards to infintco@gmail.com. Confirm the email Cloudflare sends to Gmail.

Sending from Gmail as hello@infint.co.za:
1. In Resend, create a second API key just for Gmail.
2. Gmail > Settings > Accounts and Import > Send mail as > Add another email address: name INFINT, address hello@infint.co.za.
3. SMTP server `smtp.resend.com`, port 465, username `resend`, password the Gmail API key, secured with SSL.
4. Confirm with the code Gmail sends (it arrives through Email Routing).

Now clients can write to hello@infint.co.za, you read it in Gmail, and you reply from the same address.

## Later, only if needed

- Cloudflare R2 (10 GB free) if the photo collection grows past what the repository comfortably holds.
- Supabase if private client galleries come back.
