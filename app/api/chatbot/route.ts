import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const SYSTEM_PROMPT = `
You are "ReCircle EcoBot (ग्रीन मित्र)", the expert AI assistant for Circular Economy, Waste Segregation, and Recycling in India.
Answer the user's specific waste question directly and practically in friendly Hinglish/English/Hindi with concise bullet points.
`;

export async function POST(req: NextRequest) {
  try {
    const { message, lang = "hi" } = await req.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const lower = message.toLowerCase().trim();

    // 1. Instant Domain Knowledge Rules for Everyday Indian Waste Items
    if (lower.includes("pizza")) {
      const pizzaReply = lang === "hi"
        ? `🍕 **पिज़्ज़ा और पिज़्ज़ा बॉक्स का नियम (Pizza Waste Guide)**:
- **पिज़्ज़ा व बचा हुआ खाना**: 🟢 **गीला कचरा (Wet Waste)** - इसे हरे डस्टबिन में कंपोस्ट के लिए डालें।
- **चीज़/तेल लगा डिब्बा (Greasy Box)**: तेल लगे गत्ते रीसायकल **नहीं** होते। इसे गीले कचरे या नॉन-रीसायकलेबल बिन में डालें।
- **साफ़ सूखा गत्ता (Clean Cardboard)**: 🔵 **सूखा कबाड़ (Dry Recyclables)** - इसे ReCircle पर बेचें (₹14/kg)।`
        : `🍕 **Pizza & Pizza Box Rules**:
- **Pizza / Leftover Food**: 🟢 **Wet Waste (Organic)** - Put into the green bin for composting.
- **Greasy / Cheese-stained Box**: Cannot be recycled with clean paper. Dispose of in wet/compost or non-recyclable reject bin.
- **Clean Top Lid (No Grease)**: 🔵 **Dry Recyclable** - Can be sold on ReCircle (₹14/kg).`;
      return NextResponse.json({ reply: pizzaReply });
    }

    if (lower.includes("milk") || lower.includes("दूध") || lower.includes("pouch") || lower.includes("packet")) {
      const milkReply = lang === "hi"
        ? `🥛 **दूध की थैलियां व पैकेट (Milk Pouches)**:
- दूध की थैलियां (LDPE Plastic) **100% रीसायकलेबल** हैं!
- **नियम**: थैली को पानी से एक बार धोकर सूखा लें, फिर सूखे कचरे में रखें।
- ReCircle पर प्लास्टिक का भाव **₹18/किलो** है।`
        : `🥛 **Milk Packets & Pouches**:
- Milk pouches (LDPE Plastic) are **100% recyclable**!
- **Rule**: Rinse with water, dry thoroughly, and bundle with dry recyclables.
- ReCircle pays **₹18/kg** for clean plastics.`;
      return NextResponse.json({ reply: milkReply });
    }

    if (lower.includes("battery") || lower.includes("cell") || lower.includes("charger") || lower.includes("phone") || lower.includes("headphone") || lower.includes("laptop") || lower.includes("wire") || lower.includes("cable") || lower.includes("electronic") || lower.includes("e-waste")) {
      const ewasteReply = lang === "hi"
        ? `📱 **ई-कचरा व इलेक्ट्रॉनिक्स (E-Waste Rules)**:
- हेडफोन, चार्जर, बैटरियां, पुराने मोबाइल और तार **ई-कचरा** हैं।
- इन्हें सामान्य डस्टबिन में कभी न फेंकें क्योंकि इनसे जहरीले रसायन निकलते हैं।
- ReCircle पर ई-कचरा पिकअप बुक करें - **₹70/किलो** पक्का फेयर भाव पाएं!`
        : `📱 **E-Waste & Electronics Rules**:
- Headphones, chargers, batteries, laptops, and wires are **Hazardous E-Waste**.
- Never throw them into common municipal bins.
- Book an E-Waste pickup on ReCircle to get **₹70/kg guaranteed fair price**!`;
      return NextResponse.json({ reply: ewasteReply });
    }

    if (lower.includes("thermocol") || lower.includes("styrofoam")) {
      const thermoReply = lang === "hi"
        ? `📦 **थर्मोकोल (Thermocol / EPS)**:
- थर्मोकोल सूखा कचरा है परंतु इसे रीसायकल करना कठिन होता है।
- इसे साफ़ रखें और बड़े इलेक्ट्रॉनिक पैकिंग थर्मोकोल को ReCircle मिक्स्ड ड्राई रीसायकल में दें।`
        : `📦 **Thermocol / Styrofoam (EPS)**:
- Thermocol is dry waste but difficult to recycle. Keep clean and hand over large electronic packing thermocol in ReCircle bulk pickup.`;
      return NextResponse.json({ reply: thermoReply });
    }

    if (lower.includes("medicine") || lower.includes("tablet") || lower.includes("दवा") || lower.includes("sanitary") || lower.includes("diaper") || lower.includes("pad") || lower.includes("bandage")) {
      const sanitaryReply = lang === "hi"
        ? `🔴 **सैनिटरी व बायोमेडिकल कचरा (Sanitary & Medical Waste)**:
- इस्तेमाल किए गए नैपकिन, डायपर और एक्सपायर दवाइयां **रीसायकल नहीं होतीं**।
- **नियम**: इन्हें अखबार में लपेटकर लाल डॉट (🔴) लगाकर नगरपालिका के बायो-मेडिकल वाहन को दें।`
        : `🔴 **Sanitary & Biomedical Waste**:
- Used sanitary pads, diapers, and expired medicines are **Hazardous / Reject Waste (NOT recyclable)**.
- **Rule**: Wrap securely in newspaper, mark with a red dot (🔴), and hand over to municipal sanitary disposal.`;
      return NextResponse.json({ reply: sanitaryReply });
    }

    if (lower.includes("rate") || lower.includes("price") || lower.includes("bhav") || lower.includes("daam") || lower.includes("bhaav") || lower.includes("रेट") || lower.includes("भाव")) {
      const priceReply = lang === "hi"
        ? `💰 **आज के ताज़ा कबाड़ भाव (Live Scrap Benchmark Prices)**:
- 📱 **ई-कचरा (Electronics & Gadgets)**: ₹70 / kg
- ⚙️ **धातु व लोहा (Metal & Iron)**: ₹35 / kg
- 🧴 **प्लास्टिक (HDPE/PET Plastic)**: ₹18 / kg
- 📦 **गत्ता व कागज़ (Cardboard & Paper)**: ₹14 / kg
- 🍾 **कांच की बोतलें (Glass)**: ₹5 / kg
*100% भुगतान सीधे सफाई मित्र द्वारा दिया जाता है।*`
        : `💰 **Live Scrap Benchmark Prices**:
- 📱 **E-Waste (Electronics & Gadgets)**: ₹70 / kg
- ⚙️ **Metal & Iron**: ₹35 / kg
- 🧴 **Plastics (HDPE/PET)**: ₹18 / kg
- 📦 **Cardboard & Paper**: ₹14 / kg
- 🍾 **Glass Bottles**: ₹5 / kg
*100% direct payout by the worker with zero middleman deductions.*`;
      return NextResponse.json({ reply: priceReply });
    }

    if (lower.includes("karma") || lower.includes("point") || lower.includes("reward") || lower.includes("voucher") || lower.includes("अंक")) {
      const karmaReply = lang === "hi"
        ? `🌟 **ग्रीन कर्मा अंक (Green Karma Points)**:
- हर 1 किलो रीसायकल करने पर **+10 कर्मा अंक** मिलते हैं।
- दोस्तों को रेफर करने पर **+100 कर्मा अंक** मिलते हैं।
- इन अंकों से बिजली बिल छूट, मेट्रो कार्ड और कंपोस्ट कूपन रिडीम कर सकते हैं!`
        : `🌟 **Green Karma Rewards**:
- Earn **+10 Karma Points** for every 1 kg recycled.
- Earn **+100 Points** for referring neighbors.
- Redeem for electricity bill discounts, metro transit vouchers, and organic compost discounts!`;
      return NextResponse.json({ reply: karmaReply });
    }

    // 2. Try Groq SDK with short timeout for other custom questions
    const apiKey = process.env.GROQ_API_KEY;

    if (apiKey && apiKey.trim().length > 0 && apiKey !== "your_groq_api_key_here") {
      try {
        const groq = new Groq({ apiKey, timeout: 2500 });
        const completion = await groq.chat.completions.create({
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: message },
          ],
          model: "openai/gpt-oss-20b",
          temperature: 0.3,
          max_tokens: 400,
        });

        const reply = completion.choices[0]?.message?.content;
        if (reply && reply.trim().length > 0) {
          return NextResponse.json({ reply });
        }
      } catch (err) {
        // Fall through to general guide
      }
    }

    // 3. Fallback
    const fallbackReply = lang === "hi"
      ? `🌱 **कचरा छंटाई गाइड (Waste Guide)**:
- 🟢 **गीला कचरा**: बचा खाना, फल/सब्जी छिलके (हरा डस्टबिन).
- 🔵 **सूखा कबाड़**: प्लास्टिक (₹18/kg), गत्ता (₹14/kg), लोहा (₹35/kg), कांच (₹5/kg).
- 🔴 **ई-कचरा**: इलेक्ट्रॉनिक्स, चार्जर, बैटरियां (₹70/kg).
आप किसी भी वस्तु के बारे में पूछ सकते हैं (उदा: "दूध की थैलियां", "पिज़्ज़ा बॉक्स", "दवाइयां")!`
      : `🌱 **Waste Segregation Guide**:
- 🟢 **Wet Waste**: Leftover food, fruit/vegetable peels (Green Bin).
- 🔵 **Dry Recyclables**: Plastic (₹18/kg), Cardboard (₹14/kg), Metal (₹35/kg), Glass (₹5/kg).
- 🔴 **E-Waste**: Electronics, chargers, batteries (₹70/kg).
Ask about any specific item (e.g., "milk packets", "pizza boxes", "expired medicines")!`;

    return NextResponse.json({ reply: fallbackReply });

  } catch (error: any) {
    console.error("Chatbot API Error:", error);
    return NextResponse.json({
      reply: "ReCircle EcoBot: कृपया अपना सवाल पुनः पूछें।"
    });
  }
}
