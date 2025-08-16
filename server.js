// ✅ FIXED Fetch Crane Data by model OR code
app.get("/api/crane/:code", async (req, res) => {
  try {
    console.log("🔍 Searching for:", req.params.code);

    const query = {
      $or: [
        { code: req.params.code },
        { model: new RegExp("^" + req.params.code + "$", "i") } // case-insensitive
      ]
    };

    const crane = await Crane.findOne(query);
    console.log("✅ Found:", crane);

    if (!crane) {
      return res.status(404).json({ message: "❌ No data found for this model or error code" });
    }

    res.status(200).json(crane);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "❌ Error fetching crane data" });
  }
});

// ✅ EXTRA: Flexible Search by query params
// Example: /api/search?code=E003 OR /api/search?model=HIAB T-HiDuo 018
app.get("/api/search", async (req, res) => {
  try {
    const { model, code } = req.query;
    let query = {};

    if (model) {
      query.model = new RegExp(model, "i"); // partial & case-insensitive
    }
    if (code) {
      query.code = code; // exact match
    }

    console.log("🔍 Search Query:", query);

    const cranes = await Crane.find(query);

    if (!cranes || cranes.length === 0) {
      return res.status(404).json({ message: "❌ No data found for given query" });
    }

    res.status(200).json(cranes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "❌ Error during search" });
  }
});
