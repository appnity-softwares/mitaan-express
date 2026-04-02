/**
 * MitaanExpress — Complete Development Seed
 * Run: node seed_dev.js
 *
 * Populates: Admin, Categories, Tags, Settings (Hindi name), Articles (EN+HI), Blogs, Media
 */

const prisma = require('./prisma');
const bcrypt = require('bcryptjs');

// ─── Helpers ─────────────────────────────────────────────────────────────────

function slug(str) {
    return str.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

// ─── Data ────────────────────────────────────────────────────────────────────

const CATEGORIES = [
    { name: 'National',       nameHi: 'राष्ट्रीय',     slug: 'national',       icon: 'Landmark',    color: '#dc2626', sortOrder: 1 },
    { name: 'State News',     nameHi: 'राज्य समाचार',   slug: 'state-news',     icon: 'FolderTree',  color: '#b91c1c', sortOrder: 2 },
    { name: 'Politics',       nameHi: 'राजनीति',        slug: 'politics',       icon: 'ShieldAlert', color: '#7f1d1d', sortOrder: 3 },
    { name: 'Sports',         nameHi: 'खेल',            slug: 'sports',         icon: 'Trophy',      color: '#15803d', sortOrder: 4 },
    { name: 'Entertainment',  nameHi: 'मनोरंजन',        slug: 'entertainment',  icon: 'Film',        color: '#9333ea', sortOrder: 5 },
    { name: 'Technology',     nameHi: 'तकनीक',          slug: 'technology',     icon: 'Cpu',         color: '#1d4ed8', sortOrder: 6 },
    { name: 'Business',       nameHi: 'व्यापार',         slug: 'business',       icon: 'TrendingUp',  color: '#0369a1', sortOrder: 7 },
    { name: 'Health',         nameHi: 'स्वास्थ्य',       slug: 'health',         icon: 'Activity',    color: '#16a34a', sortOrder: 8 },
    { name: 'Education',      nameHi: 'शिक्षा',          slug: 'education',      icon: 'BookOpen',    color: '#7c3aed', sortOrder: 9 },
    { name: 'Chhattisgarh',   nameHi: 'छत्तीसगढ़',       slug: 'chhattisgarh',   icon: 'Sunrise',     color: '#ea580c', sortOrder: 10 },
];

const TAGS = [
    { name: 'Breaking',        nameHi: 'ब्रेकिंग',       slug: 'breaking' },
    { name: 'Trending',        nameHi: 'ट्रेंडिंग',       slug: 'trending' },
    { name: 'MitaanExclusive', nameHi: 'मितान एक्सक्लूसिव', slug: 'mitaan-exclusive' },
    { name: 'India',           nameHi: 'भारत',            slug: 'india' },
    { name: 'Chhattisgarh',    nameHi: 'छत्तीसगढ़',        slug: 'chhattisgarh-tag' },
    { name: 'Opinion',         nameHi: 'विचार',            slug: 'opinion' },
];

const ARTICLES_EN = [
    {
        title: 'Chhattisgarh Government Launches New Educational Initiative for Rural Areas',
        slug: 'chhattisgarh-education-rural-initiative',
        shortDescription: 'The state government has announced a landmark program to improve digital literacy across 5,000 villages.',
        content: `<p>The Chhattisgarh government announced today a landmark educational initiative aimed at bringing digital literacy to over 5,000 rural villages across the state. Chief Minister addressed the press conference at Raipur, outlining the ambitious plan to install computer labs, provide internet connectivity, and train local teachers.</p>
<p>"Education is the foundation of development," the Chief Minister stated. "We aim to ensure no child in Chhattisgarh is left behind in the digital revolution."</p>
<p>The program, backed by ₹2,400 crore in state and central funds, will be implemented in three phases over the next two years. Phase one begins immediately with 500 model villages.</p>
<h2>Key Highlights</h2>
<ul><li>5,000 villages to receive high-speed broadband</li><li>Smart classrooms in 12,000 government schools</li><li>Teacher training programs for 45,000 educators</li><li>Free tablets for students in Classes 8–12</li></ul>
<p>Education experts have welcomed the initiative. "This could transform educational outcomes in one of India's most rural states," noted Dr. Priya Sharma of Pandit Ravi Shankar University.</p>`,
        image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&q=80&w=1600',
        categorySlug: 'education',
        isMustRead: true,
        isFeatured: true,
        language: 'en',
        views: 1240,
        authorName: 'Mitaan Desk',
    },
    {
        title: 'India Records Historic GDP Growth of 8.2% in Q3 FY2026',
        slug: 'india-gdp-growth-q3-2026',
        shortDescription: "India's economy surges to 8.2% in Q3, driven by manufacturing and services sector performance.",
        content: `<p>India's GDP growth accelerated to 8.2% in the third quarter of FY2026, according to data released by the Ministry of Statistics on Thursday. This marks the highest growth rate in six quarters and positions India as the world's fastest-growing major economy.</p>
<p>The manufacturing sector led with 9.1% growth, driven by PLI (Production Linked Incentive) scheme beneficiaries. The services sector, which contributes nearly 55% to GDP, grew by 8.4%.</p>
<p>Finance Minister credited the strong performance to government capital expenditure, robust domestic consumption, and rising exports in electronics and pharmaceuticals.</p>
<p>"India's fundamentals have never been stronger," the Finance Minister said. "We are on track to become a $5 trillion economy by 2027."</p>`,
        image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=1600',
        categorySlug: 'business',
        isMustRead: true,
        isTrending: true,
        language: 'en',
        views: 3870,
        authorName: 'Business Desk',
    },
    {
        title: 'Indian Cricket Team Wins Test Series Against England 3-1',
        slug: 'india-wins-test-series-england-2026',
        shortDescription: 'Team India clinches the five-match Test series against England with a dominating 3-1 victory.',
        content: `<p>Team India sealed a commanding 3-1 Test series victory against England on Thursday, completing one of the most dominant home series performances in recent memory. The final Test at Mumbai saw India win by an innings and 45 runs.</p>
<p>Rohit Sharma's men were imperious throughout the series, with the spin duo of Ravindra Jadeja and R Ashwin sharing 58 wickets between them. Shubman Gill was the standout batter, scoring 623 runs at an average of 89.</p>
<p>England's batting lineup consistently struggled against turning pitches, with only Zak Crawley and Joe Root showing resistance.</p>
<blockquote>"This team has shown unbelievable character," said captain Rohit Sharma at the post-match presentation. "Every player contributed to this historic win."</blockquote>`,
        image: 'https://images.unsplash.com/photo-1540747913346-19212a4b423b?auto=format&fit=crop&q=80&w=1600',
        categorySlug: 'sports',
        isTrending: true,
        isFeatured: true,
        language: 'en',
        views: 5620,
        authorName: 'Sports Desk',
    },
    {
        title: 'Raipur Smart City Project Phase 2 Inaugurated',
        slug: 'raipur-smart-city-phase-2',
        shortDescription: 'Phase 2 of Raipur Smart City project launched, focusing on traffic management and digital civic services.',
        content: `<p>Raipur's Smart City mission entered a transformative new phase Thursday as Phase 2 was inaugurated by the Chief Minister. The ₹1,800 crore project focuses on intelligent traffic management systems, digitized civic services, and public Wi-Fi expansion across the city.</p>
<p>Key components include 500 AI-enabled traffic cameras, an integrated command center for real-time city monitoring, and a dedicated app allowing residents to access 45 government services from their smartphones.</p>
<p>"Raipur is becoming a model for Tier-2 smart cities in India," said the Smart City CEO. "Our goal is to make every citizen service available within 100 meters of any resident's home."</p>`,
        image: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&q=80&w=1600',
        categorySlug: 'chhattisgarh',
        isMustRead: false,
        language: 'en',
        views: 890,
        authorName: 'City Reporter',
    },
    {
        title: 'Bollywood Actor Announces Directorial Debut with Historical Drama',
        slug: 'bollywood-actor-directorial-debut-historical',
        shortDescription: 'A leading Bollywood star announces their directorial debut with an epic historical drama set in the Maratha Empire.',
        content: `<p>One of Bollywood's most bankable stars surprised the industry Thursday by announcing their directorial debut — an epic historical drama chronicling the rise of the Maratha Empire. The film, tentatively titled "Saffron Horizon," will be shot across three states with a budget exceeding ₹400 crore.</p>
<p>The announcement was made at a press conference in Mumbai, where the actor-turned-director revealed a stellar cast and production team including Grammy-winning composer A.R. Rahman attached to the project.</p>
<p>"This story needed to be told on the grandest possible scale," the director said. "I've been preparing for this for seven years."</p>
<p>Filming begins in July with an anticipated theatrical release for Diwali 2027.</p>`,
        image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=1600',
        categorySlug: 'entertainment',
        isTrending: false,
        language: 'en',
        views: 2150,
        authorName: 'Entertainment Desk',
    },
    {
        title: 'AI Startup from IIT Raipur Raises $15M Seed Funding',
        slug: 'iit-raipur-ai-startup-funding',
        shortDescription: 'An AI startup founded by IIT Raipur alumni secures $15 million in seed funding led by a US-based VC firm.',
        content: `<p>AgriSense AI, a startup founded by IIT Raipur alumni, announced a $15 million seed funding round on Wednesday, led by Silicon Valley–based VC firm Horizon Ventures. The company develops AI-powered crop monitoring and yield prediction systems for smallholder farmers.</p>
<p>The startup's platform uses satellite imagery, IoT soil sensors, and machine learning to provide farmers with real-time advisory on irrigation, fertilisation, and pest control — reducing input costs by up to 30%.</p>
<p>"We're solving a $200 billion problem in Indian agriculture," said co-founder and CEO Arjun Maheshwari. "Our technology is currently deployed across 2.4 lakh acres in Chhattisgarh and Madhya Pradesh."</p>
<p>The funding will be used to expand to three new states and add 50 engineers to the team.</p>`,
        image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=1600',
        categorySlug: 'technology',
        language: 'en',
        views: 1850,
        authorName: 'Tech Desk',
    },
];

const ARTICLES_HI = [
    {
        title: 'छत्तीसगढ़ में नई स्वास्थ्य नीति लागू, 10 लाख परिवारों को मिलेगा लाभ',
        slug: 'chhattisgarh-health-policy-10-lakh-families',
        shortDescription: 'राज्य सरकार ने नई आयुष्मान छत्तीसगढ़ योजना के तहत 10 लाख परिवारों को मुफ्त स्वास्थ्य सेवाएं देने की घोषणा की।',
        content: `<p>छत्तीसगढ़ सरकार ने गुरुवार को एक ऐतिहासिक स्वास्थ्य नीति की घोषणा की जिसके अंतर्गत राज्य के 10 लाख से अधिक परिवारों को निःशुल्क चिकित्सा सेवाएं उपलब्ध कराई जाएंगी। मुख्यमंत्री ने रायपुर में आयोजित प्रेस वार्ता में इस योजना की विस्तृत जानकारी दी।</p>
<p>नई आयुष्मान छत्तीसगढ़ योजना के तहत प्रत्येक पात्र परिवार को सालाना 5 लाख रुपए तक का स्वास्थ्य बीमा प्रदान किया जाएगा। इस योजना में 1,500 से अधिक सरकारी और निजी अस्पताल शामिल होंगे।</p>
<h2>मुख्य बिंदु</h2>
<ul><li>10 लाख परिवारों को कवरेज</li><li>5 लाख रुपए तक का वार्षिक बीमा</li><li>1,500 अस्पतालों का नेटवर्क</li><li>आनलाइन पंजीकरण की सुविधा</li></ul>
<p>स्वास्थ्य विशेषज्ञों ने इस पहल की सराहना करते हुए कहा कि यह राज्य के स्वास्थ्य ढांचे को मजबूत करेगी।</p>`,
        image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=1600',
        categorySlug: 'health',
        isMustRead: true,
        language: 'hi',
        views: 1090,
        authorName: 'स्वास्थ्य संवाददाता',
    },
    {
        title: 'भारत-पाक सीमा पर सेना का विशेष अभियान, बड़ी सफलता मिली',
        slug: 'india-pak-border-army-operation-success',
        shortDescription: 'सेना ने सीमा पर घुसपैठ की कोशिश नाकाम की, दो आतंकियों को मार गिराया।',
        content: `<p>भारतीय सेना ने बुधवार की रात जम्मू-कश्मीर की नियंत्रण रेखा पर एक बड़ी घुसपैठ की कोशिश को नाकाम कर दिया। सुरक्षा बलों के साथ हुई मुठभेड़ में दो आतंकवादी मारे गए जबकि एक जवान घायल हुए हैं।</p>
<p>रक्षा प्रवक्ता ने बताया कि रात करीब दो बजे सेना के जवानों को नियंत्रण रेखा के पास संदिग्ध गतिविधि की सूचना मिली। इसके बाद सटीक कार्रवाई करते हुए अभियान को सफलतापूर्वक पूरा किया गया।</p>
<p>घटनास्थल की तलाशी में भारी मात्रा में हथियार, गोलाबारूद और अन्य सामग्री बरामद की गई है। अभियान अभी भी जारी है।</p>`,
        image: 'https://images.unsplash.com/photo-1569163139394-de4e5f43e5ca?auto=format&fit=crop&q=80&w=1600',
        categorySlug: 'national',
        isBreaking: true,
        isTrending: true,
        language: 'hi',
        views: 4320,
        authorName: 'राष्ट्रीय संवाददाता',
    },
    {
        title: 'रायपुर में नई मेट्रो लाइन का शिलान्यास, 2028 तक होगी तैयार',
        slug: 'raipur-metro-line-foundation-2028',
        shortDescription: 'रायपुर को मिलने वाली नई मेट्रो लाइन का शिलान्यास हुआ। यह लाइन शहर के प्रमुख क्षेत्रों को जोड़ेगी।',
        content: `<p>रायपुर शहर के विकास की कड़ी में एक और महत्वपूर्ण कदम उठाते हुए गुरुवार को नई मेट्रो लाइन का शिलान्यास किया गया। यह मेट्रो लाइन शहर के तीन प्रमुख क्षेत्रों —  न्यू राजेंद्र नगर, तेलीबांधा और माना एयरपोर्ट — को आपस में जोड़ेगी।</p>
<p>परियोजना की कुल लंबाई 28 किलोमीटर होगी और इसमें 22 स्टेशन बनाए जाएंगे। अनुमानित लागत 6,500 करोड़ रुपए है। इसे 2028 तक पूरा करने का लक्ष्य है।</p>
<p>मुख्यमंत्री ने कहा, "यह मेट्रो परियोजना रायपुर को देश के सबसे आधुनिक शहरों में से एक बनाने में महत्वपूर्ण भूमिका निभाएगी।"</p>`,
        image: 'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?auto=format&fit=crop&q=80&w=1600',
        categorySlug: 'chhattisgarh',
        language: 'hi',
        views: 2180,
        authorName: 'शहर संवाददाता',
    },
];

const BLOGS = [
    {
        title: 'Why Hindi Journalism Needs a Digital Revolution',
        slug: 'hindi-journalism-digital-revolution',
        shortDescription: 'Hindi is spoken by 600 million people, yet Hindi digital journalism remains underfunded and under-read. Here is why that needs to change.',
        content: `<p>There are approximately 600 million Hindi speakers in the world, making it the third most spoken language globally. Yet when one looks at the landscape of digital journalism in Hindi, the picture is strikingly different from what a language of this scale deserves.</p>
<p>Most Hindi news portals are digital extensions of print newspapers — slow to adopt multimedia, averse to long-form investigation, and dependent on advertising models that have been collapsing globally since 2015.</p>
<h2>The Opportunity</h2>
<p>The rise of JioPhone and low-cost Android devices has brought over 200 million new Hindi-speaking internet users online since 2018. These readers — young, mobile-first, and hungry for content — are being served largely by YouTube creators and WhatsApp forwards rather than credible news organisations.</p>
<blockquote>"The reader is ready. The journalism industry hasn't caught up yet." — Priya Mahajan, Editor, Digital Ink</blockquote>
<p>Mitaan Express was founded on the belief that quality Hindi journalism, presented with digital-native care, can build the kind of audience trust that drives sustainable journalism.</p>`,
        image: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=1600',
        categorySlug: 'education',
        language: 'en',
        isMustRead: true,
        isFeatured: true,
        views: 1750,
        authorName: 'Mitaan Editorial',
    },
    {
        title: 'डिजिटल भारत में पत्रकारिता की चुनौतियाँ',
        slug: 'digital-bharat-patrakarita-chunautiyan',
        shortDescription: 'डिजिटल युग में हिंदी पत्रकारिता के सामने आने वाली प्रमुख चुनौतियों और अवसरों का विश्लेषण।',
        content: `<p>भारत में डिजिटल क्रांति ने पत्रकारिता के परिदृश्य को पूरी तरह बदल दिया है। आज जब देश में 80 करोड़ से अधिक इंटरनेट उपयोगकर्ता हैं, तो हिंदी पत्रकारों के सामने एक ऐतिहासिक अवसर भी है और एक कठिन चुनौती भी।</p>
<p>एक ओर जहां डिजिटल माध्यमों ने पाठकों तक पहुंच को आसान बनाया है, वहीं फर्जी खबरों और क्लिकबेट संस्कृति ने विश्वसनीय पत्रकारिता की नींव को कमजोर किया है।</p>
<h2>मुख्य चुनौतियाँ</h2>
<p>पहली चुनौती है तथ्य-जांच की संस्कृति को विकसित करना। जब WhatsApp और Facebook पर हर दिन लाखों झूठी खबरें वायरल होती हैं, तो पाठकों को सच और झूठ में अंतर करना मुश्किल हो जाता है।</p>
<p>दूसरी चुनौती है आर्थिक स्थिरता। विज्ञापन राजस्व में गिरावट के साथ, कई हिंदी मीडिया संस्थान पाठक सदस्यता मॉडल की ओर बढ़ रहे हैं — लेकिन यह परिवर्तन आसान नहीं है।</p>`,
        image: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&q=80&w=1600',
        categorySlug: 'education',
        language: 'hi',
        isMustRead: true,
        views: 945,
        authorName: 'संपादकीय मंडल',
    },
];

const SETTINGS = [
    { key: 'site_title',            value: 'Mitaan Express' },
    { key: 'site_title_hi',         value: 'मितान एक्सप्रेस' },
    { key: 'site_tagline',          value: 'Voice of Truth' },
    { key: 'site_tagline_hi',       value: 'सच्चाई की आवाज़' },
    { key: 'site_email',            value: 'hello@mitaanexpress.com' },
    { key: 'site_phone',            value: '+91 9131-000000' },
    { key: 'donation_upi_id',       value: 'mitaanexpress@okaxis' },
    { key: 'donation_account_holder', value: 'Mitaan Express Media Trust' },
    { key: 'ad_homepage_top_enabled', value: 'true' },
    { key: 'page_gallery_enabled',  value: 'true' },
    { key: 'page_poetry_enabled',   value: 'true' },
    { key: 'page_blogs_enabled',    value: 'true' },
    { key: 'page_live_enabled',     value: 'true' },
    { key: 'page_donation_enabled', value: 'true' },
    { key: 'social_twitter',        value: 'https://twitter.com/mitaanexpress' },
    { key: 'social_facebook',       value: 'https://facebook.com/mitaanexpress' },
    { key: 'social_instagram',      value: 'https://instagram.com/mitaanexpress' },
    { key: 'social_youtube',        value: 'https://youtube.com/@mitaanexpress' },
];

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
    console.log('\n🌱 MitaanExpress Development Seed Starting...\n');

    // 1. Admin User
    console.log('👤 Creating admin user...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@mitaan.com' },
        update: {},
        create: {
            email: 'admin@mitaan.com',
            password: hashedPassword,
            name: 'Mitaan Admin',
            role: 'ADMIN',
        },
    });
    console.log(`   ✓ Admin: ${admin.email} / password: admin123`);

    // 2. Categories
    console.log('\n📂 Creating categories...');
    const catMap = {};
    for (const cat of CATEGORIES) {
        const c = await prisma.category.upsert({
            where: { slug: cat.slug },
            update: { nameHi: cat.nameHi, icon: cat.icon, color: cat.color, sortOrder: cat.sortOrder },
            create: cat,
        });
        catMap[cat.slug] = c;
        console.log(`   ✓ ${cat.name} (${cat.nameHi})`);
    }

    // 3. Tags
    console.log('\n🏷️  Creating tags...');
    const tagMap = {};
    for (const tag of TAGS) {
        const t = await prisma.tag.upsert({
            where: { name: tag.name },
            update: {},
            create: tag,
        });
        tagMap[tag.slug] = t;
        console.log(`   ✓ ${tag.name}`);
    }

    // 4. Settings
    console.log('\n⚙️  Applying settings...');
    for (const s of SETTINGS) {
        await prisma.setting.upsert({
            where: { key: s.key },
            update: { value: s.value },
            create: s,
        });
    }
    console.log(`   ✓ ${SETTINGS.length} settings applied`);

    // 5. Articles (English)
    console.log('\n📰 Creating English articles...');
    for (const art of ARTICLES_EN) {
        const cat = catMap[art.categorySlug];
        if (!cat) { console.warn(`   ⚠️  Category not found: ${art.categorySlug}`); continue; }
        const { categorySlug, ...data } = art;
        await prisma.article.upsert({
            where: { slug: art.slug },
            update: {},
            create: {
                ...data,
                categoryId: cat.id,
                authorId: admin.id,
                status: 'PUBLISHED',
                published: true,
                publishedAt: new Date(),
            },
        });
        console.log(`   ✓ [EN] ${art.title.substring(0, 60)}...`);
    }

    // 6. Articles (Hindi)
    console.log('\n📰 Creating Hindi articles...');
    for (const art of ARTICLES_HI) {
        const cat = catMap[art.categorySlug];
        if (!cat) { console.warn(`   ⚠️  Category not found: ${art.categorySlug}`); continue; }
        const { categorySlug, ...data } = art;
        await prisma.article.upsert({
            where: { slug: art.slug },
            update: {},
            create: {
                ...data,
                categoryId: cat.id,
                authorId: admin.id,
                status: 'PUBLISHED',
                published: true,
                publishedAt: new Date(),
            },
        });
        console.log(`   ✓ [HI] ${art.title.substring(0, 60)}...`);
    }

    // 7. Blogs
    console.log('\n✍️  Creating blogs...');
    for (const blog of BLOGS) {
        const cat = catMap[blog.categorySlug];
        const { categorySlug, ...data } = blog;
        await prisma.blog.upsert({
            where: { slug: blog.slug },
            update: {},
            create: {
                ...data,
                ...(cat ? { categoryId: cat.id } : {}),
                authorId: admin.id,
                status: 'PUBLISHED',
                published: true,
            },
        });
        console.log(`   ✓ ${blog.title.substring(0, 60)}...`);
    }

    // 8. Media
    console.log('\n🖼️  Creating media samples...');
    await prisma.media.createMany({
        data: [
            { type: 'IMAGE', title: 'Raipur City Festival 2026',    url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=1600', isPublished: true },
            { type: 'IMAGE', title: 'Harvest Season Chhattisgarh',  url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1600', isPublished: true },
            { type: 'IMAGE', title: 'Rural School Project Launch',   url: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&q=80&w=1600', isPublished: true },
            { type: 'VIDEO', title: 'Mitaan Express Special Report', url: 'https://www.youtube.com/watch?v=3fumBcKC6RE', isPublished: true },
            { type: 'VIDEO', title: 'PM Address to Nation',          url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', isPublished: true },
        ],
        skipDuplicates: true,
    });
    console.log('   ✓ 5 media items added');

    console.log('\n✅ Seeding Complete!\n');
    console.log('─────────────────────────────────────────');
    console.log('  Admin Login:  admin@mitaan.com');
    console.log('  Password:     admin123');
    console.log('  Articles:     ' + (ARTICLES_EN.length + ARTICLES_HI.length) + ' (EN + HI)');
    console.log('  Blogs:        ' + BLOGS.length);
    console.log('  Categories:   ' + CATEGORIES.length);
    console.log('─────────────────────────────────────────\n');
}

main()
    .catch((e) => {
        console.error('\n❌ Seeding Failed:\n', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        process.exit(0);
    });
