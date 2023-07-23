// 144,000 test cases for Arc Flash Calculator Class using Jest
const arcFlashCalculator = require('./ArcFlashCalculatorClass');
let fs = require('fs');
let csv = require('fast-csv');

describe('Arc Flash Calculator Class', () => {
    let testcases = [];

    // create beforeAll function to import test case data from CSV file
    beforeAll(async () => {
        return new Promise((resolve, reject) => {
            fs.createReadStream(__dirname+'/ieee_1584_spreadsheet_results.csv')
            .pipe(csv.parse({ headers: true }))
            .on('error', error => reject(error))
            .on('data', row => testcases.push(row))
            .on('end', () => {
                resolve(testcases);
            });
        });
    });

    afterAll(() => {
        testcases = [];
    });

    test('should import CSV data into this test', () => {
        expect(testcases.length).toBeGreaterThan(0);
    });

    // Test case data format
    // EC,V_oc,I_bf,G,D,T,width,height,depth,I_arc_max,E_joules_max,AFB_max,I_arc_min,E_joules_min,AFB_min
    
    // test each row of test case data
    test('should calculate arc flash energy and arc flash boundary with 144,000 different tests', () => {
        let worst_case_E_cal_percent_error = 0;
        let worst_case_AFB_in_percent_error = 0;
        for (let i = 0; i < testcases.length; i++) {
            const testcase = testcases[i];
            const ec = testcase.EC; //VCB, VCBB, HCB, VOA, HOA
            const sec_v = testcase.V_oc * 1000; //convert kV to V
            const I_bf = testcase.I_bf; //kA
            const G = testcase.G; //mm
            const D_in = testcase.D * 0.03937; //convert mm to in
            const width_in = testcase.width * 0.03937; //convert mm to in
            const height_in = testcase.height * 0.03937; //convert mm to in
            const depth_in = testcase.depth * 0.03937; //convert mm to in
            const T = testcase.T; //ms
            const E_cal_expected = testcase.E_joules_max * 0.2390057356; //convert J to cal
            const AFB_in_expected = testcase.AFB_max * 0.03937; //convert mm to in

            calc = new arcFlashCalculator(sec_v, I_bf, ec, G, D_in, width_in, height_in, depth_in, T);
            expect(calc.E_cal).toBeCloseTo(E_cal_expected,1); //1 decimal place precision
            expect(calc.AFB_in).toBeCloseTo(AFB_in_expected,1); //1 decimal place precision
            // find worst case percentage difference between calculated and expected values
            const E_cal_percent_error = Math.abs((calc.E_cal - E_cal_expected) / E_cal_expected) * 100;
            const AFB_in_percent_error = Math.abs((calc.AFB_in - AFB_in_expected) / AFB_in_expected) * 100;
            if (E_cal_percent_error > worst_case_E_cal_percent_error) {
                worst_case_E_cal_percent_error = E_cal_percent_error;
            }
            if (AFB_in_percent_error > worst_case_AFB_in_percent_error) {
                worst_case_AFB_in_percent_error = AFB_in_percent_error;
            }
            
        }
        console.log('worst case E_cal percent error: ' + worst_case_E_cal_percent_error * 100 + '%');
        console.log('worst case AFB_in percent error: ' + worst_case_AFB_in_percent_error * 100 + '%');
    });

    // I_bf_out_of_bounds tests
    test('should throw error if I_bf is out of bounds 480v 108ka', () => {
        const sec_v = 480;
        const I_bf = 108;
        const ec = 'VCB';
        const G = 50;
        const D_in = 10;
        const width_in = 20;
        const height_in = 20;
        const depth_in = 20;
        const T = 0.1;
        expect(() => {
            calc = new arcFlashCalculator(sec_v, I_bf, ec, G, D_in, width_in, height_in, depth_in, T);
        }
        ).toThrow('I_bf must be in ranges: 208V-600V: 0.5Ka to 106kA OR 601V-15000V: 0.2kA to 65kA');
    });

    test('should throw error if I_bf is out of bounds 480v 0.4ka', () => {
        const sec_v = 480;
        const I_bf = 0.4;
        const ec = 'VCB';
        const G = 50;
        const D_in = 10;
        const width_in = 20;
        const height_in = 20;
        const depth_in = 20;
        const T = 0.1;
        expect(() => {
            calc = new arcFlashCalculator(sec_v, I_bf, ec, G, D_in, width_in, height_in, depth_in, T);
        }
        ).toThrow('I_bf must be in ranges: 208V-600V: 0.5Ka to 106kA OR 601V-15000V: 0.2kA to 65kA');
    });

    test('should throw error if I_bf is out of bounds 800v 110ka', () => {
        const sec_v = 800;
        const I_bf = 110;
        const ec = 'VCB';
        const G = 50;
        const D_in = 10;
        const width_in = 20;
        const height_in = 20;
        const depth_in = 20;
        const T = 0.1;
        expect(() => {
            calc = new arcFlashCalculator(sec_v, I_bf, ec, G, D_in, width_in, height_in, depth_in, T);
        }
        ).toThrow('I_bf must be in ranges: 208V-600V: 0.5Ka to 106kA OR 601V-15000V: 0.2kA to 65kA');
    });

    test('should throw error if I_bf is out of bounds 800v 0.1ka', () => {
        const sec_v = 800;
        const I_bf = 0.1;
        const ec = 'VCB';
        const G = 50;
        const D_in = 10;
        const width_in = 20;
        const height_in = 20;
        const depth_in = 20;
        const T = 0.1;
        expect(() => {
            calc = new arcFlashCalculator(sec_v, I_bf, ec, G, D_in, width_in, height_in, depth_in, T);
        }
        ).toThrow('I_bf must be in ranges: 208V-600V: 0.5Ka to 106kA OR 601V-15000V: 0.2kA to 65kA');
    });

    // sec_v_out_of_bounds tests
    test('should throw error if sec_v is out of bounds 120v', () => {
        const sec_v = 120;
        const I_bf = 20;
        const ec = 'VCB';
        const G = 50;
        const D_in = 10;
        const width_in = 20;
        const height_in = 20;
        const depth_in = 20;
        const T = 0.1;
        expect(() => {
            calc = new arcFlashCalculator(sec_v, I_bf, ec, G, D_in, width_in, height_in, depth_in, T);
        }
        ).toThrow('sec_v must be >= 208 and <= 15000');
    });

    test('should throw error if sec_v is out of bounds 18000v', () => {
        const sec_v = 18000;
        const I_bf = 20;
        const ec = 'VCB';
        const G = 50;
        const D_in = 10;
        const width_in = 20;
        const height_in = 20;
        const depth_in = 20;
        const T = 0.1;
        expect(() => {
            calc = new arcFlashCalculator(sec_v, I_bf, ec, G, D_in, width_in, height_in, depth_in, T);
        }
        ).toThrow('sec_v must be >= 208 and <= 15000');
    });

    // ec_out_of_bounds tests
    test('should throw error if ec is out of bounds', () => {
        const sec_v = 480;
        const I_bf = 20;
        const ec = 'VCA';
        const G = 50;
        const D_in = 10;
        const width_in = 20;
        const height_in = 20;
        const depth_in = 20;
        const T = 0.1;
        expect(() => {
            calc = new arcFlashCalculator(sec_v, I_bf, ec, G, D_in, width_in, height_in, depth_in, T);
        }
        ).toThrow('ec must be one of VCB, VCBB, HCB, VOA, HOA');
    });

    // G_out_of_bounds tests
    test('should throw error if G is out of bounds', () => {
        const sec_v = 480;
        const I_bf = 20;
        const ec = 'VCB';
        const G = 0;
        const D_in = 10;
        const width_in = 20;
        const height_in = 20;
        const depth_in = 20;
        const T = 0.1;
        expect(() => {
            calc = new arcFlashCalculator(sec_v, I_bf, ec, G, D_in, width_in, height_in, depth_in, T);
        }).toThrow('G must be > 0');
    });

    test('should throw error if G is out of bounds', () => {
        const sec_v = 480;
        const I_bf = 20;
        const ec = 'VCB';
        const G = -5;
        const D_in = 10;
        const width_in = 20;
        const height_in = 20;
        const depth_in = 20;
        const T = 0.1;        
        expect(() => {
            calc = new arcFlashCalculator(sec_v, I_bf, ec, G, D_in, width_in, height_in, depth_in, T);        
        }).toThrow('G must be > 0');
    });

    test('should throw error if width_in is out of bounds', () => {
        const sec_v = 480;
        const I_bf = 20;
        const ec = 'VCB';
        const G = 50;
        const D_in = 10;
        const width_in = 0;
        const height_in = 20;
        const depth_in = 20;
        const T = 0.1;        
        expect(() => {
            calc = new arcFlashCalculator(sec_v, I_bf, ec, G, D_in, width_in, height_in, depth_in, T);        
        }).toThrow('width_in must be > 0');
    });

    test('should throw error if height_in is out of bounds', () => {
        const sec_v = 480;
        const I_bf = 20;
        const ec = 'VCB';
        const G = 50;
        const D_in = 10;
        const width_in = 20;
        const height_in = 0;
        const depth_in = 20;
        const T = 0.1;        
        expect(() => {
            calc = new arcFlashCalculator(sec_v, I_bf, ec, G, D_in, width_in, height_in, depth_in, T);        
        }).toThrow('height_in must be > 0');
    });

    test('should throw error if depth_in is out of bounds', () => {
        const sec_v = 480;
        const I_bf = 20;
        const ec = 'VCB';
        const G = 50;
        const D_in = 10;
        const width_in = 20;
        const height_in = 20;
        const depth_in = 0;
        const T = 0.1;        
        expect(() => {
            calc = new arcFlashCalculator(sec_v, I_bf, ec, G, D_in, width_in, height_in, depth_in, T);        
        }).toThrow('depth_in must be > 0');
    });

    test('should throw error if T is out of bounds', () => {
        const sec_v = 480;
        const I_bf = 20;
        const ec = 'VCB';
        const G = 50;
        const D_in = 10;
        const width_in = 20;
        const height_in = 20;
        const depth_in = 20;
        const T = 0;        
        expect(() => {
            calc = new arcFlashCalculator(sec_v, I_bf, ec, G, D_in, width_in, height_in, depth_in, T);        
        }).toThrow('T must be > 0');
    });

    test('should throw error if T is out of bounds', () => {
        const sec_v = 480;
        const I_bf = 20;
        const ec = 'VCB';
        const G = 50;
        const D_in = 10;
        const width_in = 20;
        const height_in = 20;
        const depth_in = 20;
        const T = -5;        
        expect(() => {
            calc = new arcFlashCalculator(sec_v, I_bf, ec, G, D_in, width_in, height_in, depth_in, T);        
        }).toThrow('T must be > 0');
    });

    
}); //end describe