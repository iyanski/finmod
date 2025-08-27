// Mock environment variables for testing
process.env.OPENAI_API_KEY = 'test-api-key';
process.env.NODE_ENV = 'test';

// Mock OpenAI
const mockOpenAI = jest.fn().mockImplementation(() => ({
    chat: {
        completions: {
            create: jest.fn().mockImplementation((params) => {
                // Check if this is a metrics extraction call
                const messages = params.messages;
                const lastMessage = messages[messages.length - 1];

                if (lastMessage.content.includes('key financial metrics')) {
                    // Return metrics array for extractKeyMetrics
                    return Promise.resolve({
                        choices: [{
                            message: {
                                content: JSON.stringify([
                                    'monthly_recurring_revenue',
                                    'customer_acquisition_cost',
                                    'churn_rate',
                                    'lifetime_value'
                                ])
                            }
                        }]
                    });
                } else {
                    // Return business classification for classifyBusiness
                    return Promise.resolve({
                        choices: [{
                            message: {
                                content: JSON.stringify({
                                    models: [{
                                        type: 'saas',
                                        subtype: 'b2b',
                                        confidence: 0.95,
                                        characteristics: ['subscription', 'software', 'b2b']
                                    }],
                                    intents: {
                                        currency: 'USD',
                                        startDate: '2024-01-01',
                                        timeGranularity: 'monthly',
                                        units: 'users',
                                        taxRegime: 'US corporate',
                                        geographicScope: 'national',
                                        planningHorizon: 60,
                                        keyDrivers: ['revenue_growth', 'churn_rate']
                                    },
                                    drivers: ['revenue_growth', 'customer_acquisition_cost', 'churn_rate'],
                                    confidence: 0.9
                                })
                            }
                        }]
                    });
                }
            })
        }
    }
}));

// Mock the openai module
jest.mock('openai', () => {
    const mockModule = mockOpenAI;
    mockModule.default = mockOpenAI;
    mockModule.OpenAI = mockOpenAI;
    return mockModule;
});

// Mock better-sqlite3
jest.mock('better-sqlite3', () => {
    return jest.fn().mockImplementation(() => ({
        pragma: jest.fn(),
        exec: jest.fn(),
        prepare: jest.fn().mockReturnValue({
            all: jest.fn().mockReturnValue([]),
            get: jest.fn().mockReturnValue(null),
            run: jest.fn()
        }),
        close: jest.fn()
    }));
});

// Mock fs for file operations
jest.mock('fs', () => ({
    existsSync: jest.fn().mockReturnValue(false),
    mkdirSync: jest.fn(),
    writeFileSync: jest.fn(),
    readFileSync: jest.fn().mockReturnValue(Buffer.from('test')),
    unlinkSync: jest.fn(),
    rmdirSync: jest.fn(),
    readdirSync: jest.fn().mockReturnValue([]),
    createWriteStream: jest.fn().mockReturnValue({
        on: jest.fn().mockReturnThis(),
        write: jest.fn(),
        end: jest.fn()
    })
}));

// Mock archiver
jest.mock('archiver', () => {
    return jest.fn().mockImplementation(() => ({
        pipe: jest.fn().mockReturnThis(),
        on: jest.fn().mockReturnThis(),
        file: jest.fn().mockReturnThis(),
        finalize: jest.fn()
    }));
});

// Mock ExcelJS
jest.mock('exceljs', () => {
    const mockWorkbook = jest.fn().mockImplementation(() => ({
        creator: '',
        lastModifiedBy: '',
        created: new Date(),
        modified: new Date(),
        addWorksheet: jest.fn().mockReturnValue({
            columns: [],
            addRow: jest.fn(),
            getRow: jest.fn().mockReturnValue({
                font: {},
                fill: {},
                eachCell: jest.fn(),
                eachRow: jest.fn()
            }),
            eachRow: jest.fn(),
            eachCell: jest.fn(),
            rowCount: 10
        }),
        getWorksheet: jest.fn().mockReturnValue({
            rowCount: 10,
            getCell: jest.fn().mockReturnValue({
                formula: ''
            })
        }),
        defineName: jest.fn(),
        xlsx: {
            writeBuffer: jest.fn().mockResolvedValue(Buffer.from('test'.repeat(1000)))
        }
    }));

    return {
        default: {
            Workbook: mockWorkbook
        },
        Workbook: mockWorkbook
    };
});