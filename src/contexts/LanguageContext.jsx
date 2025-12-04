import React, { createContext, useState, useContext, useEffect } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState('en');

    // Translations dictionary
    const translations = {
        en: {
            home: 'Home',
            publicIp: 'Public IP',
            ipLookup: 'IP Lookup',
            whois: 'WHOIS',
            dns: 'DNS Lookup',
            blacklist: 'Blacklist',
            breach: 'Breach Check',
            proxy: 'Proxy Check',
            email: 'Trace Email',
            speedTest: 'Speed Test',
            weather: 'Weather',
            welcome: 'Welcome to',
            subtitle: 'Your comprehensive suite of network security and IP analysis tools.',
            tools: 'Powerful Tools',
            free: 'Free to Use',
            available: 'Available',
            explore: 'Explore Our Tools',
            exploreDesc: 'Choose from our comprehensive collection of IP and network analysis tools',
            tryNow: 'Try Now',
            fast: 'Lightning Fast',
            fastDesc: 'Get instant results with our optimized API integrations and modern infrastructure',
            secure: 'Secure & Private',
            secureDesc: 'Your queries are processed securely with no data retention or tracking',
            modern: 'Modern Interface',
            modernDesc: 'Enjoy a beautiful, responsive design with smooth 3D animations',
            yourIp: 'Your Public IP Address',
            detecting: 'Detecting your IP...',
            errorIp: 'Could not detect IP',
            location: 'Location',
            coordinates: 'Coordinates',
            isp: 'ISP',
            timezone: 'Timezone',
            postal: 'Postal Code',
            asn: 'ASN',
            capital: 'Capital',
            continent: 'Continent',
            currency: 'Currency',
            countryCode: 'Country Code',
            additionalInfo: 'Additional Information',
            retry: 'Retry',
        },
        km: {
            home: 'ទំព័រដើម',
            publicIp: 'អាសយដ្ឋាន IP',
            ipLookup: 'ស្វែងរក IP',
            whois: 'WHOIS',
            dns: 'ស្វែងរក DNS',
            blacklist: 'បញ្ជីខ្មៅ',
            breach: 'ពិនិត្យសុវត្ថិភាព',
            proxy: 'ពិនិត្យ Proxy',
            email: 'តាមដាន Email',
            speedTest: 'ពិនិត្យល្បឿនអ៊ីនធឺណិត',
            weather: 'អាកាសធាតុ',
            welcome: 'សូមស្វាគមន៍មកកាន់',
            subtitle: 'ឧបករណ៍វិភាគបណ្តាញ និងសុវត្ថិភាព IP ដ៏ទូលំទូលាយរបស់អ្នក។',
            tools: 'ឧបករណ៍ខ្លាំងក្លា',
            free: 'ប្រើប្រាស់ដោយឥតគិតថ្លៃ',
            available: 'អាចប្រើបាន',
            explore: 'ស្វែងយល់ពីឧបករណ៍របស់យើង',
            exploreDesc: 'ជ្រើសរើសពីបណ្តុំឧបករណ៍វិភាគ IP និងបណ្តាញដ៏ទូលំទូលាយរបស់យើង',
            tryNow: 'សាកល្បងឥឡូវនេះ',
            fast: 'លឿនរហ័ស',
            fastDesc: 'ទទួលបានលទ្ធផលភ្លាមៗជាមួយការតភ្ជាប់ API ដ៏ល្អប្រសើរ និងហេដ្ឋារចនាសម្ព័ន្ធទំនើប',
            secure: 'សុវត្ថិភាព & ឯកជនភាព',
            secureDesc: 'ការសាកសួររបស់អ្នកត្រូវបានដំណើរការដោយសុវត្ថិភាពដោយគ្មានការរក្សាទុកទិន្នន័យ',
            modern: 'ចំណុចប្រទាក់ទំនើប',
            modernDesc: 'រីករាយជាមួយការរចនាដ៏ស្រស់ស្អាត និងឆ្លើយតបជាមួយចលនា 3D រលូន',
            yourIp: 'អាសយដ្ឋាន IP សាធារណៈរបស់អ្នក',
            detecting: 'កំពុងស្វែងរក IP របស់អ្នក...',
            errorIp: 'មិនអាចរកឃើញ IP',
            location: 'ទីតាំង',
            coordinates: 'កូអរដោនេ',
            isp: 'អ្នកផ្តល់សេវាអ៊ីនធឺណិត (ISP)',
            timezone: 'តំបន់ពេលវេលា',
            postal: 'លេខកូដប្រៃសណីយ៍',
            asn: 'ASN',
            capital: 'រាជធានី/ទីក្រុង',
            continent: 'ទ្វីប',
            currency: 'រូបិយប័ណ្ណ',
            countryCode: 'លេខកូដប្រទេស',
            additionalInfo: 'ព័ត៌មានបន្ថែម',
            retry: 'ព្យាយាមម្តងទៀត',
        }
    };

    const t = (key) => {
        return translations[language][key] || key;
    };

    const switchLanguage = (lang) => {
        setLanguage(lang);
        // Update body font class based on language
        if (lang === 'km') {
            document.body.classList.add('font-khmer');
            document.body.classList.remove('font-english');
        } else {
            document.body.classList.add('font-english');
            document.body.classList.remove('font-khmer');
        }
    };

    return (
        <LanguageContext.Provider value={{ language, switchLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};
