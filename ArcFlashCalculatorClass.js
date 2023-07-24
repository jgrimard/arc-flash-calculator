//Class for Arc Flash Calculator
//sec_v: Secondary Voltage (V)
//I_bf: Bolted Fault Current (kA)
//ec: Electrode Configuration (VCB, VCBB, HCB, VOA, HOA)
//G: Conductor Gap (mm)
//D: Working Distance (in)
//width: Box Width (in)
//height: Box Height (in)
//depth: Box Depth (in)
//T: Arc Time (ms)

class ArcFlashCalculator {
    constructor(sec_v, I_bf, ec, G, D_in, width_in, height_in, depth_in, T) {
        this.sec_v = sec_v;
        this.I_bf = I_bf;
        this.ec = ec;
        this.G = G;
        this.D_in = D_in;
        this.width_in = width_in;
        this.height_in = height_in;
        this.depth_in = depth_in;
        this.T = T;

        //parse inputs as numbers
        this.sec_v = parseFloat(this.sec_v);
        this.I_bf = parseFloat(this.I_bf);
        this.G = parseFloat(this.G);
        this.D_in = parseFloat(this.D_in);
        this.width_in = parseFloat(this.width_in);
        this.height_in = parseFloat(this.height_in);
        this.depth_in = parseFloat(this.depth_in);
        this.T = parseFloat(this.T);

        // validate inputs
        if (this.sec_v < 208 || this.sec_v > 15000 || isNaN(this.sec_v)) {
            throw new Error('sec_v must be >= 208 and <= 15000');
        }
        if (this.I_bf <= 0 || (this.sec_v > 600 && this.I_bf > 65) || (this.sec_v <= 600 && this.I_bf > 106)
            || (this.sec_v <= 600 && this.I_bf < 0.5) || (this.sec_v > 600 && this.I_bf < 0.2) || isNaN(this.I_bf)) {
            throw new Error('I_bf must be in ranges: 208V-600V: 0.5Ka to 106kA OR 601V-15000V: 0.2kA to 65kA');
        }
        if (this.ec !== 'VCB' && this.ec !== 'VCBB' && this.ec !== 'HCB' && this.ec !== 'VOA' && this.ec !== 'HOA') {
            throw new Error('ec must be one of VCB, VCBB, HCB, VOA, HOA');
        }
        if (this.G <= 0 || isNaN(this.G)) {
            throw new Error('G must be > 0');
        }
        if (this.D_in <= 0 || isNaN(this.D_in)) {
            throw new Error('D_in must be > 0');
        }
        if (this.width_in <= 0 || isNaN(this.width_in)) {
            throw new Error('width_in must be > 0');
        }
        if (this.height_in <= 0 || isNaN(this.height_in)) {
            throw new Error('height_in must be > 0');
        }
        if (this.depth_in <= 0 || isNaN(this.depth_in)) {
            throw new Error('depth_in must be > 0');
        }
        if (this.T <= 0 || isNaN(this.T)) {
            throw new Error('T must be > 0');
        }

        this.calculate();
    }

    // convert inputs to mm
    calculate() {
        this.D = this.D_in * 25.4;
        this.width = this.width_in * 25.4;
        this.height = this.height_in * 25.4;
        this.depth = this.depth_in * 25.4;

        //Etype can be either Typical or Shallow.  
        this.Etype;
        if (this.sec_v < 600 && this.width < 508 && this.height < 508 && this.depth <= 203.2) {
            this.Etype = "Shallow";
        } else this.Etype = "Typical";

        //Enclosure Constant A
        this.A;
        switch (this.ec) {
            case "VCB":
                this.A = 4;
                break;
            case "VCBB":
                this.A = 10;
                break;
            case "HCB":
                this.A = 10;
                break;
            default:
                this.A = 0;
        }

        //Enclosure Constant B
        this.B;
        switch (this.ec) {
            case "VCB":
                this.B = 20;
                break;
            case "VCBB":
                this.B = 24;
                break;
            case "HCB":
                this.B = 22;
                break;
            default:
                this.B = 0;
        }

        //width_capped
        this.width_capped = this.width;
        if (this.width_capped > 1244.6) {
            this.width_capped = 1244.6;
        }

        //height_capped
        this.height_capped = this.height;
        if (this.height_capped > 1244.6) {
            this.height_capped = 1244.6;
        }

        //EQ_11
        this.EQ_11 = (660.4 + (this.width - 660.4) * (this.sec_v / 1000 + this.A) / this.B) * 25.4 ** -1;
        if (this.c === "VOA" || this.ec === "HOA") {
            this.EQ_11 = 0;
        }

        //EQ_12
        this.EQ_12 = (660.4 + (this.height - 660.4) * (this.sec_v / 1000 + this.A) / this.B) * 25.4 ** -1;
        if (this.ec === "VOA" || this.ec === "HOA") {
            this.EQ_12 = 0;
        }

        //EQ_11_capped
        this.EQ_11_capped = (660.4 + (this.width_capped - 660.4) * (this.sec_v / 1000 + this.A) / this.B) * 25.4 ** -1;
        if (this.ec === "VOA" || this.ec === "HOA") {
            this.EQ_11_capped = 0;
        }

        //EQ_12_capped
        this.EQ_12_capped = (660.4 + (this.height_capped - 660.4) * (this.sec_v / 1000 + this.A) / this.B) * 25.4 ** -1;
        if (this.ec === "VOA" || this.ec === "HOA") {
            this.EQ_12_capped = 0;
        }

        //width_1
        this.width_1;
        switch (true) {
            case this.width < 508:
                if (this.Etype === "Typical") {
                    this.width_1 = 20;
                } else {
                    this.width_1 = 0.03937 * this.width;
                }
                break;
            case this.width <= 660.4:
                this.width_1 = 0.03937 * this.width
                break;
            case this.width <= 1244.6:
                this.width_1 = this.EQ_11;
                break;
            default:
                this.width_1 = this.EQ_11_capped;
        }

        //height_1
        this.height_1;
        switch (true) {
            case this.height < 508:
                if (this.Etype === "Typical") {
                    this.height_1 = 20;
                } else {
                    this.height_1 = 0.03937 * this.height;
                }
                break;
            case this.height <= 660.4:
                this.height_1 = 0.03937 * this.height
                break;
            case this.height <= 1244.6:
                if (this.ec === "VCB") {
                    this.height_1 = 0.03937 * this.height;
                } else {
                    this.height_1 = this.EQ_12;
                }
                break;
            default:
                if (this.ec === "VCB") {
                    this.height_1 = 49;
                } else {
                    this.height_1 = this.EQ_12_capped;
                }
        }

        //EES
        this.EES = (this.height_1 + this.width_1) / 2

        //Eq_14
        this.Eq_14 = 0;
        if (this.ec === "VCB" || this.ec === "VCBB" || this.ec === "HCB") {
            this.table7TypicalValue = ArcFlashCalculator.table7Typical.find(item => item.ec === this.ec)
            this.Eq_14 = (this.table7TypicalValue.b1 * this.EES ** 2) + (this.table7TypicalValue.b2 * this.EES) +
                (this.table7TypicalValue.b3)
        }

        //Eq_15
        this.Eq_15 = 0;
        if (this.ec === "VCB" || this.ec === "VCBB" || this.ec === "HCB") {
            this.table7ShallowValue = ArcFlashCalculator.table7Shallow.find(item => item.ec === this.ec)
            this.Eq_15 = 1 / ((this.table7ShallowValue.b1 * this.EES ** 2) + (this.table7ShallowValue.b2 * this.EES) +
                (this.table7ShallowValue.b3))
        }

        //CF
        this.CF = 0;
        if (this.ec === "VOA" || this.ec === "HOA") {
            this.CF = 1;
        } else if (this.Etype === "Typical") {
            this.CF = this.Eq_14;
        } else {
            this.CF = this.Eq_15;
        }

        //I_arc600
        //kA
        this.table1Value600 = ArcFlashCalculator.table1.find(item => item.id === "600" + this.ec)
        this.I_arc600 = 10 ** (this.table1Value600.k1 + this.table1Value600.k2 * Math.log10(this.I_bf) +
            this.table1Value600.k3 * Math.log10(this.G)) * (this.table1Value600.k4 * this.I_bf ** 6 +
            this.table1Value600.k5 * this.I_bf ** 5 + this.table1Value600.k6 * this.I_bf ** 4 +
            this.table1Value600.k7 * this.I_bf ** 3 + this.table1Value600.k8 * this.I_bf ** 2 +
            this.table1Value600.k9 * this.I_bf + this.table1Value600.k10);


        //I_arc2700
        //kA
        this.table1Value2700 = ArcFlashCalculator.table1.find(item => item.id === "2700" + this.ec)
        this.I_arc2700 = 10 ** (this.table1Value2700.k1 + this.table1Value2700.k2 * Math.log10(this.I_bf) +
            this.table1Value2700.k3 * Math.log10(this.G)) * (this.table1Value2700.k4 * this.I_bf ** 6 +
            this.table1Value2700.k5 * this.I_bf ** 5 + this.table1Value2700.k6 * this.I_bf ** 4 +
            this.table1Value2700.k7 *	this.I_bf ** 3 + this.table1Value2700.k8 * this.I_bf ** 2 +
            this.table1Value2700.k9 * this.I_bf +	this.table1Value2700.k10);

        //I_arc14300
        //kA
        this.table1Value14300 = ArcFlashCalculator.table1.find(item => item.id === "14300" + this.ec)
        this.I_arc14300 = 10 ** (this.table1Value14300.k1 + this.table1Value14300.k2 * Math.log10(this.I_bf) +
            this.table1Value14300.k3 * Math.log10(this.G)) * (this.table1Value14300.k4 * this.I_bf ** 6 +
            this.table1Value14300.k5 * this.I_bf ** 5 + this.table1Value14300.k6 * this.I_bf ** 4 +
            this.table1Value14300.k7 * this.I_bf ** 3 + this.table1Value14300.k8 * this.I_bf ** 2 +
            this.table1Value14300.k9 * this.I_bf + this.table1Value14300.k10);

        //I_arc_LT600
        //kA
        this.I_arc_LT600 = 1 / (Math.sqrt(((0.6 / (this.sec_v / 1000)) ** 2) * ((1 / this.I_arc600 ** 2) -
            ((0.6 ** 2 - (this.sec_v / 1000) ** 2) / (0.6 ** 2 * this.I_bf ** 2)))))

        //I_arc_1
        //kA
        this.I_arc_1 = ((this.I_arc2700 - this.I_arc600) / 2.1) * ((this.sec_v / 1000) - 2.7) + this.I_arc2700;

        //I_arc_2
        //kA
        this.I_arc_2 = ((this.I_arc14300 - this.I_arc2700) / 11.6) * ((this.sec_v / 1000) - 14.3) + this.I_arc14300;

        //I_arc_3
        //kA
        this.I_arc_3 = ((this.I_arc_1 * (2.7 - this.sec_v / 1000)) / 2.1) + ((this.I_arc_2 *
            (this.sec_v / 1000 - 0.6)) / 2.1);

        //I_arc
        //kA
        this.I_arc = 0;
        if (this.sec_v > 2700) {
            this.I_arc = this.I_arc_2;
        } else if (this.sec_v > 600) {
            this.I_arc = this.I_arc_3;
        } else {
            this.I_arc = this.I_arc_LT600;
        }

        //E_LT600
        //kA
        this.table3ValueLT600 = ArcFlashCalculator.table3.find(item => item.ec === this.ec)
        this.E_LT600 = 12.552 / 50 * this.T * 10 ** (this.table3ValueLT600.k1 + this.table3ValueLT600.k2 *
            Math.log10(this.G) + this.table3ValueLT600.k3 * this.I_arc600 / (this.table3ValueLT600.k4 *
            this.I_bf ** 7 + this.table3ValueLT600.k5 * this.I_bf ** 6 + this.table3ValueLT600.k6 *
            this.I_bf ** 5 + this.table3ValueLT600.k7 * this.I_bf ** 4 + this.table3ValueLT600.k8 *
            this.I_bf ** 3 + this.table3ValueLT600.k9 * this.I_bf ** 2 + this.table3ValueLT600.k10 * this.I_bf) + 
            this.table3ValueLT600.k11 * Math.log10(this.I_bf) + this.table3ValueLT600.k12 * Math.log10(this.D) +
            this.table3ValueLT600.k13 * Math.log10(this.I_arc) + Math.log10(1 / this.CF));

        //E_600
        //J/cm2
        this.table3Value = ArcFlashCalculator.table3.find(item => item.ec === this.ec)
        this.E_600 = 12.552 / 50 * this.T * 10 ** (this.table3Value.k1 + this.table3Value.k2 *
            Math.log10(this.G) + this.table3Value.k3 * this.I_arc600 / (this.table3Value.k4 *
            this.I_bf ** 7 + this.table3Value.k5 * this.I_bf ** 6 + this.table3Value.k6 *
            this.I_bf ** 5 + this.table3Value.k7 * this.I_bf ** 4 + this.table3Value.k8 *
            this.I_bf ** 3 + this.table3Value.k9 * this.I_bf ** 2 + this.table3Value.k10 * this.I_bf) +
            this.table3Value.k11 * Math.log10(this.I_bf) + this.table3Value.k12 * Math.log10(this.D) +
            this.table3Value.k13 * Math.log10(this.I_arc600) + Math.log10(1 / this.CF));

        //E_2700
        //J/cm2
        this.table4Value = ArcFlashCalculator.table4.find(item => item.ec === this.ec)
        this.E_2700 = 12.552 / 50 * this.T * 10 ** (this.table4Value.k1 + this.table4Value.k2 *
            Math.log10(this.G) + this.table4Value.k3 * this.I_arc2700 / (this.table4Value.k4 * 
            this.I_bf ** 7 + this.table4Value.k5 * this.I_bf ** 6 + this.table4Value.k6 * 
            this.I_bf ** 5 + this.table4Value.k7 * this.I_bf ** 4 +	this.table4Value.k8 * 
            this.I_bf ** 3 + this.table4Value.k9 * this.I_bf ** 2 + this.table4Value.k10 * this.I_bf) + 
            this.table4Value.k11 * Math.log10(this.I_bf) +	this.table4Value.k12 * Math.log10(this.D) +
            this.table4Value.k13 * Math.log10(this.I_arc2700) + Math.log10(1 / this.CF));


        //E_14300
        //J/cm2
        this.table5Value = ArcFlashCalculator.table5.find(item => item.ec === this.ec)
        this.E_14300 = 12.552 / 50 * this.T * 10 ** (this.table5Value.k1 + this.table5Value.k2 *
        Math.log10(this.G) + this.table5Value.k3 * this.I_arc14300 / (this.table5Value.k4 * 
            this.I_bf ** 7 + this.table5Value.k5 * this.I_bf ** 6 + this.table5Value.k6 * 
            this.I_bf ** 5 + this.table5Value.k7 * this.I_bf ** 4 +	this.table5Value.k8 * 
            this.I_bf ** 3 + this.table5Value.k9 * this.I_bf ** 2 + this.table5Value.k10 * this.I_bf) + 
            this.table5Value.k11 * Math.log10(this.I_bf) + this.table5Value.k12 * Math.log10(this.D) +
            this.table5Value.k13 * Math.log10(this.I_arc14300) + Math.log10(1 / this.CF));

        //E_1
        //J/cm2
        this.E_1 = ((this.E_2700 - this.E_600) / 2.1) * ((this.sec_v / 1000) - 2.7) + this.E_2700;

        //E_2
        //J/cm2
        this.E_2 = ((this.E_14300 - this.E_2700) / 11.6) * ((this.sec_v / 1000) - 14.3) + this.E_14300;

        //E_3
        //J/cm2
        this.E_3 = ((this.E_1 * (2.7 - this.sec_v / 1000)) / 2.1) + ((this.E_2 * (this.sec_v / 1000 - 0.6)) / 2.1);

        //E
        //J/cm2
        this.E = 0;
        if (this.sec_v > 2700) {
            this.E = this.E_2;
        } else if (this.sec_v > 600) {
            this.E = this.E_3;
        } else {
            this.E = this.E_LT600;
        }

        //AFB_LT600
        //mm
        this.AFB_LT600 = 10 ** ((this.table3Value.k1 + this.table3Value.k2 * Math.log10(this.G) + 
            (this.table3Value.k3 * this.I_arc600) / (this.table3Value.k4 * this.I_bf ** 7 + 
            this.table3Value.k5 * this.I_bf ** 6 + this.table3Value.k6 * this.I_bf ** 5 + 
            this.table3Value.k7 * this.I_bf ** 4 + this.table3Value.k8 * this.I_bf ** 3 + 
            this.table3Value.k9 * this.I_bf ** 2 + this.table3Value.k10 * this.I_bf) + 
            this.table3Value.k11 * Math.log10(this.I_bf) + this.table3Value.k13 *	Math.log10(this.I_arc) + 
            Math.log10(1 / this.CF) - Math.log10(20 / this.T)) / -(this.table3Value.k12));


        //AFB_600
        //mm
        this.AFB_600 = 10 ** ((this.table3Value.k1 + this.table3Value.k2 * Math.log10(this.G) + 
            (this.table3Value.k3 * this.I_arc600) / (this.table3Value.k4 * this.I_bf ** 7 + 
            this.table3Value.k5 * this.I_bf ** 6 + this.table3Value.k6 * this.I_bf ** 5 + 
            this.table3Value.k7 * this.I_bf ** 4 + this.table3Value.k8 * this.I_bf ** 3 + 
            this.table3Value.k9 * this.I_bf ** 2 + this.table3Value.k10 * this.I_bf) + 
            this.table3Value.k11 * Math.log10(this.I_bf) + this.table3Value.k13 *	Math.log10(this.I_arc600) + 
            Math.log10(1 / this.CF) - Math.log10(20 / this.T)) / -(this.table3Value.k12));

        //AFB_2700
        //mm
        this.AFB_2700 = 10 ** ((this.table4Value.k1 + this.table4Value.k2 * Math.log10(this.G) + 
            (this.table4Value.k3 * this.I_arc2700) / (this.table4Value.k4 * this.I_bf ** 7 + 
            this.table4Value.k5 * this.I_bf ** 6 + this.table4Value.k6 * this.I_bf ** 5 + 
            this.table4Value.k7 * this.I_bf ** 4 + this.table4Value.k8 * this.I_bf ** 3 + 
            this.table4Value.k9 * this.I_bf ** 2 + this.table4Value.k10 * this.I_bf) + 
            this.table4Value.k11 * Math.log10(this.I_bf) + this.table4Value.k13 * Math.log10(this.I_arc2700) +
            Math.log10(1 / this.CF) - Math.log10(20 / this.T)) / -(this.table4Value.k12));

        //AFB_14300
        //mm
        this.AFB_14300 = 10 ** ((this.table5Value.k1 + this.table5Value.k2 * Math.log10(this.G) +
            (this.table5Value.k3 * this.I_arc14300) / (this.table5Value.k4 * this.I_bf ** 7 + 
            this.table5Value.k5 * this.I_bf ** 6 + this.table5Value.k6 * this.I_bf ** 5 + 
            this.table5Value.k7 * this.I_bf ** 4 + this.table5Value.k8 * this.I_bf ** 3 + 
            this.table5Value.k9 * this.I_bf ** 2 + this.table5Value.k10 * this.I_bf) + 
            this.table5Value.k11 * Math.log10(this.I_bf) + this.table5Value.k13 * Math.log10(this.I_arc14300) + 
            Math.log10(1 / this.CF) - Math.log10(20 / this.T)) / -(this.table5Value.k12));

        //AFB_1
        //mm
        this.AFB_1 = ((this.AFB_2700 - this.AFB_600) / 2.1) * ((this.sec_v / 1000) - 2.7) + this.AFB_2700;

        //AFB_2
        //mm
        this.AFB_2 = ((this.AFB_14300 - this.AFB_2700) / 11.6) * ((this.sec_v / 1000) - 14.3) + this.AFB_14300;

        //AFB_3
        //mm
        this.AFB_3 = ((this.AFB_1 * (2.7 - this.sec_v / 1000)) / 2.1) + ((this.AFB_2 * (this.sec_v / 1000 - 0.6)) / 2.1);

        //AFB
        //mm
        this.AFB = 0;
        if (this.sec_v > 2700) {
            this.AFB = this.AFB_2;
        } else if (this.sec_v > 600) {
            this.AFB = this.AFB_3;
        } else {
            this.AFB = this.AFB_LT600;
        }


        //E_cal
        //cal/cm2
        this.E_cal = this.E * 0.2390057356;

        //AFB_in
        //in
        this.AFB_in = this.AFB * 0.03937;

        //AFB_ftin
        //feet and inches
        this.AFB_feet = Math.floor(this.AFB_in / 12);
        this.AFB_remainingInches = (this.AFB_in - (this.AFB_feet * 12)).toFixed(0);
        this.AFB_ftin = `${this.AFB_feet}ft ${this.AFB_remainingInches}in`;

    } //end calculate function

    //Data Tables from IEEE 1584-2018
    static table1 = [
        { "id": "600VCB", "k1": -0.04287, "k2": 1.035, "k3": -0.083, "k4": 0, "k5": 0, "k6": -4.783E-09, "k7": 0.000001962, "k8": -0.000229, "k9": 0.003141, "k10": 1.092 },
        { "id": "2700VCB", "k1": 0.0065, "k2": 1.001, "k3": -0.024, "k4": -1.557E-12, "k5": 4.556E-10, "k6": -4.186E-08, "k7": 8.346E-07, "k8": 0.00005482, "k9": -0.003191, "k10": 0.9729 },
        { "id": "14300VCB", "k1": 0.005795, "k2": 1.015, "k3": -0.011, "k4": -1.557E-12, "k5": 4.556E-10, "k6": -4.186E-08, "k7": 8.346E-07, "k8": 0.00005482, "k9": -0.003191, "k10": 0.9729 },
        { "id": "600VCBB", "k1": -0.017432, "k2": 0.98, "k3": -0.05, "k4": 0, "k5": 0, "k6": -5.767E-09, "k7": 0.000002524, "k8": -0.00034, "k9": 0.01187, "k10": 1.013 },
        { "id": "2700VCBB", "k1": 0.002823, "k2": 0.995, "k3": -0.0125, "k4": 0, "k5": -9.204E-11, "k6": 2.901E-08, "k7": -0.000003262, "k8": 0.0001569, "k9": -0.004003, "k10": 0.9825 },
        { "id": "14300VCBB", "k1": 0.014827, "k2": 1.01, "k3": -0.01, "k4": 0, "k5": -9.204E-11, "k6": 2.901E-08, "k7": -0.000003262, "k8": 0.0001569, "k9": -0.004003, "k10": 0.9825 },
        { "id": "600HCB", "k1": 0.054922, "k2": 0.988, "k3": -0.11, "k4": 0, "k5": 0, "k6": -5.382E-09, "k7": 0.000002316, "k8": -0.000302, "k9": 0.0091, "k10": 0.9725 },
        { "id": "2700HCB", "k1": 0.001011, "k2": 1.003, "k3": -0.0249, "k4": 0, "k5": 0, "k6": 4.859E-10, "k7": -1.814E-07, "k8": -0.000009128, "k9": -0.0007, "k10": 0.9881 },
        { "id": "14300HCB", "k1": 0.008693, "k2": 0.999, "k3": -0.02, "k4": 0, "k5": -5.043E-11, "k6": 2.233E-08, "k7": -0.000003046, "k8": 0.000116, "k9": -0.001145, "k10": 0.9839 },
        { "id": "600VOA", "k1": 0.043785, "k2": 1.04, "k3": -0.18, "k4": 0, "k5": 0, "k6": -4.783E-09, "k7": 0.000001962, "k8": -0.000229, "k9": 0.003141, "k10": 1.092 },
        { "id": "2700VOA", "k1": -0.02395, "k2": 1.006, "k3": -0.0188, "k4": -1.557E-12, "k5": 4.556E-10, "k6": -4.186E-08, "k7": 8.346E-07, "k8": 0.00005482, "k9": -0.003191, "k10": 0.9729 },
        { "id": "14300VOA", "k1": 0.005371, "k2": 1.0102, "k3": -0.029, "k4": -1.557E-12, "k5": 4.556E-10, "k6": -4.186E-08, "k7": 8.346E-07, "k8": 0.00005482, "k9": -0.003191, "k10": 0.9729 },
        { "id": "600HOA", "k1": 0.111147, "k2": 1.008, "k3": -0.24, "k4": 0, "k5": 0, "k6": -3.895E-09, "k7": 0.000001641, "k8": -0.000197, "k9": 0.002615, "k10": 1.1 },
        { "id": "2700HOA", "k1": 0.000435, "k2": 1.006, "k3": -0.038, "k4": 0, "k5": 0, "k6": 7.859E-10, "k7": -1.914E-07, "k8": -0.000009128, "k9": -0.0007, "k10": 0.9981 },
        { "id": "14300HOA", "k1": 0.000904, "k2": 0.999, "k3": -0.02, "k4": 0, "k5": 0, "k6": 7.859E-10, "k7": -1.914E-07, "k8": -0.000009128, "k9": -0.0007, "k10": 0.9981 }
    ]
    static table3 = [
        { "ec": "VCB", "k1": 0.753364, "k2": 0.566, "k3": 1.752636, "k4": 0, "k5": 0, "k6": -4.783E-09, "k7": 0.000001962, "k8": -0.000229, "k9": 0.003141, "k10": 1.092, "k11": 0, "k12": -1.598, "k13": 0.957 },
        { "ec": "VCBB", "k1": 3.068459, "k2": 0.26, "k3": -0.098107, "k4": 0, "k5": 0, "k6": -5.767E-09, "k7": 0.000002524, "k8": -0.00034, "k9": 0.01187, "k10": 1.013, "k11": -0.06, "k12": -1.809, "k13": 1.19 },
        { "ec": "HCB", "k1": 4.073745, "k2": 0.344, "k3": -0.370259, "k4": 0, "k5": 0, "k6": -5.382E-09, "k7": 0.000002316, "k8": -0.000302, "k9": 0.0091, "k10": 0.9725, "k11": 0, "k12": -2.03, "k13": 1.036 },
        { "ec": "VOA", "k1": 0.679294, "k2": 0.746, "k3": 1.222636, "k4": 0, "k5": 0, "k6": -4.783E-09, "k7": 0.000001962, "k8": -0.000229, "k9": 0.003141, "k10": 1.092, "k11": 0, "k12": -1.598, "k13": 0.997 },
        { "ec": "HOA", "k1": 3.470417, "k2": 0.465, "k3": -0.261863, "k4": 0, "k5": 0, "k6": -3.895E-09, "k7": 0.000001641, "k8": -0.000197, "k9": 0.002615, "k10": 1.1, "k11": 0, "k12": -1.99, "k13": 1.04 }
    ]
    static table4 = [
        { "ec": "VCB", "k1": 2.40021, "k2": 0.165, "k3": 0.354202, "k4": -1.557E-12, "k5": 4.556E-10, "k6": -4.186E-08, "k7": 8.346E-07, "k8": 0.00005482, "k9": -0.003191, "k10": 0.9729, "k11": 0, "k12": -1.569, "k13": 0.9778 },
        { "ec": "VCBB", "k1": 3.870592, "k2": 0.185, "k3": -0.736618, "k4": 0, "k5": -9.204E-11, "k6": 2.901E-08, "k7": -0.000003262, "k8": 0.0001569, "k9": -0.004003, "k10": 0.9825, "k11": 0, "k12": -1.742, "k13": 1.09 },
        { "ec": "HCB", "k1": 3.486391, "k2": 0.177, "k3": -0.193101, "k4": 0, "k5": 0, "k6": 4.859E-10, "k7": -1.814E-07, "k8": -0.000009128, "k9": -0.0007, "k10": 0.9881, "k11": 0.027, "k12": -1.723, "k13": 1.055 },
        { "ec": "VOA", "k1": 3.880724, "k2": 0.105, "k3": -1.906033, "k4": -1.557E-12, "k5": 4.556E-10, "k6": -4.186E-08, "k7": 8.346E-07, "k8": 0.00005482, "k9": -0.003191, "k10": 0.9729, "k11": 0, "k12": -1.515, "k13": 1.115 },
        { "ec": "HOA", "k1": 3.616266, "k2": 0.149, "k3": -0.761561, "k4": 0, "k5": 0, "k6": 7.859E-10, "k7": -1.914E-07, "k8": -0.000009128, "k9": -0.0007, "k10": 0.9981, "k11": 0, "k12": -1.639, "k13": 1.078 }
    ]
    static table5 = [
        { "ec": "VCB", "k1": 3.825917, "k2": 0.11, "k3": -0.999749, "k4": -1.557E-12, "k5": 4.556E-10, "k6": -4.186E-08, "k7": 8.346E-07, "k8": 0.00005482, "k9": -0.003191, "k10": 0.9729, "k11": 0, "k12": -1.568, "k13": 0.99 },
        { "ec": "VCBB", "k1": 3.644309, "k2": 0.215, "k3": -0.585522, "k4": 0, "k5": -9.204E-11, "k6": 2.901E-08, "k7": -0.000003262, "k8": 0.0001569, "k9": -0.004003, "k10": 0.9825, "k11": 0, "k12": -1.677, "k13": 1.06 },
        { "ec": "HCB", "k1": 3.044516, "k2": 0.125, "k3": 0.245106, "k4": 0, "k5": -5.043E-11, "k6": 2.233E-08, "k7": -0.000003046, "k8": 0.000116, "k9": -0.001145, "k10": 0.9839, "k11": 0, "k12": -1.655, "k13": 1.084 },
        { "ec": "VOA", "k1": 3.405454, "k2": 0.12, "k3": -0.93245, "k4": -1.557E-12, "k5": 4.556E-10, "k6": -4.186E-08, "k7": 8.346E-07, "k8": 0.00005482, "k9": -0.003191, "k10": 0.9729, "k11": 0, "k12": -1.534, "k13": 0.979 },
        { "ec": "HOA", "k1": 2.04049, "k2": 0.177, "k3": 1.005092, "k4": 0, "k5": 0, "k6": 7.859E-10, "k7": -1.914E-07, "k8": -0.000009128, "k9": -0.0007, "k10": 0.9981, "k11": -0.05, "k12": -1.633, "k13": 1.151 }
    ]
    static table7Typical = [
        { ec: "VCB", b1: -0.000302, b2: 0.03441, b3: 0.4325 },
        { ec: "VCBB", b1: -0.0002976, b2: 0.032, b3: 0.479 },
        { ec: "HCB", b1: -0.0001923, b2: 0.01935, b3: 0.6899 }
    ]
    static table7Shallow = [
        { ec: "VCB", b1: 0.002222, b2: -0.02556, b3: 0.6222 },
        { ec: "VCBB", b1: -0.002778, b2: 0.1194, b3: -0.2778 },
        { ec: "HCB", b1: -0.0005556, b2: 0.03722, b3: 0.4778 }
    ]
    static equipmentTable = [
        { equipmentType: "15 kV Switchgear", 			G: 152, D_in:36, width_in: 45, height_in: 30, depth_in: 30, hideFeeders: false },
        { equipmentType: "15 kV MCC", 					G: 152, D_in:36, width_in: 36, height_in: 36, depth_in: 36, hideFeeders: false },
        { equipmentType: "5 kV Switchgear (Large)", 	G: 104, D_in:36, width_in: 36, height_in: 36, depth_in: 36, hideFeeders: false },
        { equipmentType: "5 kV Switchgear (Small)", 	G: 104, D_in:36, width_in: 45, height_in: 30, depth_in: 30, hideFeeders: false },
        { equipmentType: "5 kV MCC", 					G: 104, D_in:36, width_in: 26, height_in: 26, depth_in: 26, hideFeeders: false },
        { equipmentType: "LV Switchgear", 				G: 32, D_in:24, width_in: 20, height_in: 20, depth_in: 20, hideFeeders: false },
        { equipmentType: "LV Switchboard", 				G: 25, D_in:18, width_in: 14, height_in: 12, depth_in: 8, hideFeeders: true },
        { equipmentType: "LV MCCs and Panels (Shallow)",G: 25, D_in:18, width_in: 14, height_in: 12, depth_in: 8, hideFeeders: true },
        { equipmentType: "LV MCCs and Panels (Deep)", 	G: 25, D_in:18, width_in: 14, height_in: 12, depth_in: 9, hideFeeders: true },
        { equipmentType: "Cable Junction Box (Shallow)",G: 13, D_in:18, width_in: 14, height_in: 12, depth_in: 8, hideFeeders: true },
        { equipmentType: "Cable Junction Box (Deep)", 	G: 13, D_in:18, width_in: 14, height_in: 12, depth_in: 9, hideFeeders: true }
    ]
}//end of ArcFlashCalculator class

//export for node.js or browser
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = ArcFlashCalculator;
} else {
    window.ArcFlashCalculator = ArcFlashCalculator;
}