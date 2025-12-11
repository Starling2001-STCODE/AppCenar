const { Setting } = require("../models/Setting");

async function getItbisRate() {
    const setting = await Setting.findOne({ key: "itbis" }).lean();

    if (!setting || !setting.value) {
        return 0.18;
    }

    const normalized = String(setting.value).replace(",", ".").trim();
    const percentage = parseFloat(normalized);

    if (isNaN(percentage) || percentage < 0) {
        return 0.18;
    }

    if (percentage > 1) {
        return percentage / 100;
    }

    return percentage;
}

module.exports = { getItbisRate };
