import React, { useState } from 'react';
import {
    MessageSquare,
    Phone,
    Mail,
    CheckCircle,
    AlertCircle,
    User,
    HelpCircle,
    ChevronDown,
    ChevronUp,
    Search
} from 'lucide-react';
import { HomePageFooter } from '../components/HomePageFooter';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { API } from '../API/ApiBaseUrl';

type SupportTopic = {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
};


const SupportPage: React.FC = () => {
    const { user } = useAuth();
    const [message, setMessage] = useState<string>('');
    const [selectedTopic, setSelectedTopic] = useState<string>('');
    const [submitted, setSubmitted] = useState<boolean>(false);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const [formErrors, setFormErrors] = useState({
        topic: false,
        message: false
    });

    const supportTopics: SupportTopic[] = [
        {
            id: 'general',
            title: 'General Inquiry',
            description: 'Questions about our products or services',
            icon: <HelpCircle className="h-6 w-6" />
        },
        {
            id: 'technical',
            title: 'Technical Support',
            description: 'Help with technical issues or bugs',
            icon: <AlertCircle className="h-6 w-6" />
        },
        {
            id: 'billing',
            title: 'Billing & Payments',
            description: 'Questions about your bill or subscription',
            icon: <Mail className="h-6 w-6" />
        },
        {
            id: 'feature',
            title: 'Feature Request',
            description: 'Suggest new features or improvements',
            icon: <MessageSquare className="h-6 w-6" />
        }
    ];

    const faqs = [
        {
            question: 'How quickly will I receive a response?',
            answer: 'Our support team typically responds within 2-4 hours during business hours. For urgent matters, please use our live chat option.'
        },
        {
            question: 'What happens after I submit a support ticket?',
            answer: 'You\'ll receive a confirmation email with your ticket details. One of our support representatives will contact you at your scheduled time.'
        },
        {
            question: 'Can I change my scheduled support session?',
            answer: 'Yes, you can reschedule by clicking the link in your confirmation email or by contacting our support team.'
        },
        {
            question: 'Is there a limit to how many support requests I can submit?',
            answer: 'There is no limit for our paid customers. For free tier users, there\'s a limit of 3 support tickets per month.'
        },
        {
            question: 'How do I track the status of my ticket?',
            answer: 'You can track the status of your ticket by logging into your account and navigating to the support section. All tickets and their current status will be displayed there.'
        },
        {
            question: 'Can I request a specific support representative?',
            answer: 'Yes, if you\'ve worked with a specific representative before and would like to continue working with them, please mention their name in your support request.'
        }
    ];

    const filteredFaqs = searchQuery.trim() === ''
        ? faqs
        : faqs.filter(faq =>
            faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
        );



    const handleSubmit = async (e: React.FormEvent) => {
        try {
            e.preventDefault()
            setIsLoading(true)
            const res = await axios.post(`${API}/support/create-support-ticket`, {
                user_id: user?.userId,
                selectedTopic: selectedTopic,
                message: message
            }, {
                headers: {
                    'Content-Type': 'application/json',
                },
                withCredentials: true
            })
            const data = await res.data
            if (data) {
                toast.success(data.message)
                setSubmitted(true)
            }
        } catch (error: any) {
            console.log(error);
            toast.error(error?.response?.data?.error)


        } finally {
            setIsLoading(false)
        }
    };

    const handleReset = () => {
        setSubmitted(false);
        setMessage('');
        setSelectedTopic('');
        setFormErrors({
            topic: false,
            message: false
        });
    };

    const toggleFaq = (index: number) => {
        setExpandedFaq(expandedFaq === index ? null : index);
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                    <h1 className="text-3xl font-bold text-gray-900">Customer Support</h1>
                    <p className="mt-2 text-gray-600">We're here to help you with any questions or issues you may have.</p>
                </div>
            </header>

            <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                {submitted ? (
                    <div className="bg-white rounded-lg shadow-md p-8 text-center">
                        <div className="bg-green-50 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="h-16 w-16 text-green-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Support Ticket Submitted!</h2>
                        <p className="text-gray-600 mb-4">
                            Thank you for reaching out, <span className="font-medium">{user?.full_name}</span>.
                        </p>
                        <div className="bg-blue-50 rounded-lg p-4 max-w-md mx-auto mb-6 text-left">
                            <p className="font-medium text-blue-800 mb-2">Your request details:</p>
                            <ul className="text-sm text-gray-700 space-y-1">
                                <li><span className="font-medium">Topic:</span> {supportTopics.find(t => t.id === selectedTopic)?.title}</li>
                            </ul>
                        </div>
                        <p className="text-gray-600 mb-6">
                            One of our support representatives will contact you.
                            You will receive a confirmation email shortly with all the details.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={handleReset}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Submit Another Request
                            </button>

                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Options</h2>
                                <div className="space-y-4">
                                    <div className="flex items-center p-3 rounded-lg hover:bg-blue-50 transition-colors">
                                        <div className="bg-blue-100 p-2 rounded-full">
                                            <Phone className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-gray-900 font-medium">Call Us</p>
                                            <p className="text-gray-600">12132</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center p-3 rounded-lg hover:bg-blue-50 transition-colors">
                                        <div className="bg-blue-100 p-2 rounded-full">
                                            <Mail className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-gray-900 font-medium">Email Us</p>
                                            <p className="text-gray-600">osama@gmail.com</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center p-3 rounded-lg hover:bg-blue-50 transition-colors">
                                        <div className="bg-blue-100 p-2 rounded-full">
                                            <MessageSquare className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-gray-900 font-medium">Live Chat</p>
                                            <p className="text-gray-600">Available 24/7</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">Support Hours</h2>
                                <div className="space-y-3">
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                            <span className="font-medium text-blue-600">M-F</span>
                                        </div>
                                        <div>
                                            <p className="text-gray-900 font-medium">Monday - Friday</p>
                                            <p className="text-gray-600">8am - 8pm EST</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                            <span className="font-medium text-blue-600">Sat</span>
                                        </div>
                                        <div>
                                            <p className="text-gray-900 font-medium">Saturday</p>
                                            <p className="text-gray-600">9am - 5pm EST</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                            <span className="font-medium text-blue-600">Sun</span>
                                        </div>
                                        <div>
                                            <p className="text-gray-900 font-medium">Sunday</p>
                                            <p className="text-gray-600">Closed</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">Average Response Times</h2>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <p className="text-gray-700">General Inquiries</p>
                                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">2-4 hours</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <p className="text-gray-700">Technical Issues</p>
                                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">4-8 hours</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <p className="text-gray-700">Billing Questions</p>
                                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">1-3 hours</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <p className="text-gray-700">Feature Requests</p>
                                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">24-48 hours</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-lg shadow-md p-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">Schedule a Support Session</h2>
                                <p className="text-gray-600 mb-6">Fill out the form below and we'll get back to you as soon as possible.</p>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                            <User className="h-5 w-5 mr-2 text-blue-500" />
                                            Your Information
                                        </h3>
                                        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                                            <div>
                                                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                                    Full Name
                                                </label>
                                                <div className="mt-1 relative rounded-md shadow-sm">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <User className="h-5 w-5 text-gray-400" />
                                                    </div>
                                                    <input
                                                        type="text"
                                                        disabled
                                                        className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md bg-gray-100 py-2"
                                                        value={user?.full_name || ""}
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                                    Email Address
                                                </label>
                                                <div className="mt-1 relative rounded-md shadow-sm">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <Mail className="h-5 w-5 text-gray-400" />
                                                    </div>
                                                    <input
                                                        type="email"
                                                        disabled
                                                        className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md bg-gray-100 py-2"
                                                        value={user?.email || ""}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                            <HelpCircle className="h-5 w-5 mr-2 text-blue-500" />
                                            What can we help you with?
                                        </h3>
                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                            {supportTopics.map((topic) => (
                                                <div
                                                    key={topic.id}
                                                    className={`flex items-start p-4 border rounded-lg cursor-pointer transition-colors ${selectedTopic === topic.id
                                                            ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                                                            : 'border-gray-200 hover:bg-gray-50'
                                                        } ${formErrors.topic ? 'border-red-300' : ''}`}
                                                    onClick={() => {
                                                        setSelectedTopic(topic.id);
                                                        setFormErrors({ ...formErrors, topic: false });
                                                    }}
                                                >
                                                    <div className={`flex-shrink-0 ${selectedTopic === topic.id ? 'text-blue-500' : 'text-gray-400'}`}>
                                                        {topic.icon}
                                                    </div>
                                                    <div className="ml-4">
                                                        <p className={`text-sm font-medium ${selectedTopic === topic.id ? 'text-blue-700' : 'text-gray-900'}`}>
                                                            {topic.title}
                                                        </p>
                                                        <p className="mt-1 text-xs text-gray-500">{topic.description}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        {formErrors.topic && (
                                            <p className="mt-2 text-sm text-red-600">Please select a topic</p>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                                            How can we help you?
                                        </label>
                                        <div className="mt-1">
                                            <textarea
                                                id="message"
                                                name="message"
                                                rows={4}
                                                className={`shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${formErrors.message ? 'border-red-300 ring-1 ring-red-300' : ''
                                                    }`}
                                                placeholder="Please describe your issue in detail..."
                                                value={message}
                                                onChange={(e) => {
                                                    setMessage(e.target.value);
                                                    if (e.target.value.trim() !== '') {
                                                        setFormErrors({ ...formErrors, message: false });
                                                    }
                                                }}
                                            />
                                        </div>
                                        {formErrors.message && (
                                            <p className="mt-2 text-sm text-red-600">Please describe your issue</p>
                                        )}
                                        <p className="mt-2 text-sm text-gray-500">
                                            Be as detailed as possible to help us assist you better.
                                        </p>
                                    </div>

                                    <div className="pt-4">
                                        <button
                                            type="submit"
                                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            disabled={isLoading}
                                        >
                                            {isLoading ? (
                                                <>
                                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Submitting...
                                                </>
                                            ) : (
                                                'Submit'
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* FAQ Section */}
                <div className="mt-16">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">Frequently Asked Questions</h2>
                    <p className="text-gray-600 text-center mb-8">Find quick answers to common questions about our support services.</p>

                    <div className="max-w-3xl mx-auto mb-8">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                placeholder="Search FAQs..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md divide-y divide-gray-200">
                        {filteredFaqs.length > 0 ? (
                            filteredFaqs.map((faq, index) => (
                                <div key={index} className="overflow-hidden">
                                    <button
                                        className="p-6 w-full flex justify-between items-center text-left focus:outline-none"
                                        onClick={() => toggleFaq(index)}
                                    >
                                        <h3 className="text-lg font-medium text-gray-900">{faq.question}</h3>
                                        {expandedFaq === index ? (
                                            <ChevronUp className="h-5 w-5 text-gray-500" />
                                        ) : (
                                            <ChevronDown className="h-5 w-5 text-gray-500" />
                                        )}
                                    </button>
                                    <div
                                        className={`transition-all duration-300 ease-in-out max-h-0 overflow-hidden ${expandedFaq === index ? 'max-h-96 pb-6 px-6' : 'max-h-0'
                                            }`}
                                    >
                                        <p className="text-gray-600">{faq.answer}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center">
                                <p className="text-gray-600">No FAQs match your search. Try a different query or <a href="#" className="text-blue-600 hover:text-blue-800">contact us</a> directly.</p>
                            </div>
                        )}
                    </div>

                    {filteredFaqs.length > 0 && filteredFaqs.length < faqs.length && (
                        <div className="mt-4 text-center">
                            <p className="text-sm text-gray-600">
                                Showing {filteredFaqs.length} of {faqs.length} FAQs
                                {searchQuery && (
                                    <button
                                        className="ml-2 text-blue-600 hover:text-blue-800"
                                        onClick={() => setSearchQuery('')}
                                    >
                                        Clear search
                                    </button>
                                )}
                            </p>
                        </div>
                    )}
                </div>
            </main>

            {/* Footer */}
            <HomePageFooter />
        </div>
    );
};

export default SupportPage;