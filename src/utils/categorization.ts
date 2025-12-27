
export function categorizeTitle(title: string): string {
  const lowerTitle = title.toLowerCase();
  
  // Subscriptions (check membership before general uber/trip)
  if (lowerTitle.includes("uber *one membership") || lowerTitle.includes("one membership")) {
    return "Subscriptions";
  }
  
  // Transportation
  if (lowerTitle.includes("uber") || lowerTitle.includes("trip")) {
    return "Transportation";
  }
  if (lowerTitle.includes("auto posto") || lowerTitle.includes("posto")) {
    return "Transportation";
  }
  
  // Gym/Fitness (check before food to catch "Up Fit Food")
  if (lowerTitle.includes("up fit food") || lowerTitle.includes("up fit")) {
    return "Gym/Fitness";
  }
  if (lowerTitle.includes("academia") || lowerTitle.includes("sua academia")) {
    return "Gym/Fitness";
  }
  if (lowerTitle.includes("pac harmos")) {
    return "Gym/Fitness";
  }
  
  // Food & Dining
  if (lowerTitle.includes("ifood") || lowerTitle.includes("food")) {
    return "Food & Dining";
  }
  if (lowerTitle.includes("pizzarei") || lowerTitle.includes("pizza")) {
    return "Food & Dining";
  }
  if (lowerTitle.includes("coffee") || lowerTitle.includes("cafe")) {
    return "Food & Dining";
  }
  if (lowerTitle.includes("pao queijo") || lowerTitle.includes("master")) {
    return "Food & Dining";
  }
  if (lowerTitle.includes("royalty") || lowerTitle.includes("bar")) {
    return "Food & Dining";
  }
  if (lowerTitle.includes("janaino") || lowerTitle.includes("vegan")) {
    return "Food & Dining";
  }
  if (lowerTitle.includes("xv de novembro")) {
    return "Food & Dining";
  }
  
  // Groceries
  if (lowerTitle.includes("festval") || lowerTitle.includes("estacao")) {
    return "Groceries";
  }
  if (lowerTitle.includes("hiper comercio")) {
    return "Groceries";
  }
  
  // Medications
  if (lowerTitle.includes("farmacia") || lowerTitle.includes("drogaria")) {
    return "Medications";
  }
  if (lowerTitle.includes("raia")) {
    return "Medications";
  }
  if (lowerTitle.includes("nissei")) {
    return "Medications";
  }
  
  // Fees (check before subscriptions to catch IOF fees)
  if (lowerTitle.includes("iof")) {
    return "Fees";
  }
  
  // Subscriptions
  if (lowerTitle.includes("apple.com") || lowerTitle.includes("apple")) {
    return "Subscriptions";
  }
  if (lowerTitle.includes("google") || lowerTitle.includes("youtube")) {
    return "Subscriptions";
  }
  if (lowerTitle.includes("spotify")) {
    return "Subscriptions";
  }
  if (lowerTitle.includes("amazonprime") || lowerTitle.includes("amazon")) {
    return "Subscriptions";
  }
  if (lowerTitle.includes("facebk") || lowerTitle.includes("facebook")) {
    return "Subscriptions";
  }
  if (lowerTitle.includes("cursor")) {
    return "Subscriptions";
  }
  if (lowerTitle.includes("ifood club")) {
    return "Subscriptions";
  }
  
  // Utilities
  if (lowerTitle.includes("conta vivo") || lowerTitle.includes("vivo")) {
    return "Utilities";
  }
  if (lowerTitle.includes("bmb") || lowerTitle.includes("wifi") || lowerTitle.includes("direct")) {
    return "Utilities";
  }
  if (lowerTitle.includes("recarga") || lowerTitle.includes("correios")) {
    return "Utilities";
  }
  
  // Shopping
  if (lowerTitle.includes("shein")) {
    return "Shopping";
  }
  if (lowerTitle.includes("zara")) {
    return "Shopping";
  }
  if (lowerTitle.includes("adidas")) {
    return "Shopping";
  }
  if (lowerTitle.includes("mercadolivre") || lowerTitle.includes("ebazarco")) {
    return "Shopping";
  }
  if (lowerTitle.includes("casas bahia") || lowerTitle.includes("grupo casas")) {
    return "Shopping";
  }
  if (lowerTitle.includes("leroy merlin")) {
    return "Shopping";
  }
  if (lowerTitle.includes("magalu") || lowerTitle.includes("daza metais")) {
    return "Shopping";
  }
  if (lowerTitle.includes("temu")) {
    return "Shopping";
  }
  if (lowerTitle.includes("alipay")) {
    return "Shopping";
  }
  if (lowerTitle.includes("brexodocouro")) {
    return "Shopping";
  }
  if (lowerTitle.includes("balaroti")) {
    return "Shopping";
  }
  if (lowerTitle.includes("aconcagua")) {
    return "Shopping";
  }
  if (lowerTitle.includes("so ler")) {
    return "Shopping";
  }
  if (lowerTitle.includes("tabacaria") || lowerTitle.includes("lucky")) {
    return "Shopping";
  }
  if (lowerTitle.includes("papelaria") || lowerTitle.includes("liberdade")) {
    return "Shopping";
  }
  if (lowerTitle.includes("embalagens") || lowerTitle.includes("ponto de")) {
    return "Shopping";
  }
  if (lowerTitle.includes("grafitti")) {
    return "Shopping";
  }
  
  // Healthcare
  if (lowerTitle.includes("dermatologia") || lowerTitle.includes("aliati")) {
    return "Healthcare";
  }
  if (lowerTitle.includes("rhavi carneiro") || lowerTitle.includes("san")) {
    return "Healthcare";
  }
  
  // Insurance
  if (lowerTitle.includes("porto seguro")) {
    return "Insurance";
  }
  
  // Mortgage/Rent
  if (lowerTitle.includes("imobiliaria") || lowerTitle.includes("2000")) {
    return "Mortgage/Rent";
  }
  
  // Income/Refunds
  if (lowerTitle.includes("pagamento recebido")) {
    return "Income";
  }
  if (lowerTitle.includes("ajuste a crédito")) {
    return "Refund";
  }
  
  // Personal Services
  if (lowerTitle.includes("geraldojair")) {
    return "Personal Services";
  }
  if (lowerTitle.includes("maykon") || /^\d+/.test(lowerTitle)) {
    return "Personal Services";
  }
  
  // Other/Uncategorized
  if (lowerTitle.includes("postuma") || lowerTitle.includes("pixta")) {
    return "Other";
  }
  
  return "Other";
}
