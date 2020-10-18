import React from 'react';
import axios from 'axios';
import 'antd/dist/antd.css';
import './styles/dash.css';
import { Layout, Menu, Table, Tag, Modal, Input, Button, Row, Col, Typography, Space } from 'antd';
import { PieChartOutlined, PlusOutlined, UserOutlined, BuildOutlined, TeamOutlined, ToolOutlined, PercentageOutlined } from '@ant-design/icons';

const { Sider, Content } = Layout;
const { SubMenu } = Menu;
const { Title } = Typography;

class Dash extends React.Component {
  baseUrl = 'https://trabalho-react.glitch.me';
  state = {
    studentReady: false,
    jobReady: false,
    studentVisible: false,
    studentLoading: false,
    jobVisible: false,
    jobLoading: false,
    jobChangerVisible: false,
    jobChangeLoading: false,
    jobChangeId: '',
    jobChangeStatus: '',
    jobAllocationVisible: false,
    jobAllocationLoading: false,
    username: '',
    usernameSearch: '',
    job: '',
    jobAllocationValue: ''
  };
  studentColumns = [
    {
      title: 'Aluno',
      dataIndex: 'student',
      key: 'student',
      render: student => <a>{student}</a>
    },
    {
      title: 'Trabalho',
      dataIndex: 'job',
      key: 'job'
    }
  ];
  jobColumns = [
    {
      title: 'Id',
      dataIndex: 'id',
      key: 'id'
    },
    {
      title: 'Trabalho',
      dataIndex: 'job',
      key: 'job',
      render: job => <a>{job}</a>
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: status => {
        let color = 'green';
        if (+status > 50 && +status < 80) color = 'yellow';
        else if (+status < 50) color = 'volcano';

        return (
          <Tag color={color} key={status}>
            {`${status}%`}
          </Tag>
        );
      }
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      render: (text, record) => (
        <Space size="middle">
          <Button icon={<TeamOutlined />} onClick={() => { this.showJobAllocationModal(record.id) }} />
          <Button icon={<ToolOutlined />} onClick={() => { this.showJobChangeModal(record.id) }} />
        </Space>
      )
    }
  ]

  getUsernames = () => {
    return eval(window.localStorage.getItem('usernames'));
  };

  setUsernames = (user) => {
    let usernames = this.getUsernames();
    usernames.push(user);
    window.localStorage.setItem('usernames', JSON.stringify(usernames));
  };

  getJobs = () => {
    return eval(window.localStorage.getItem('jobs'));
  };

  setJobs = (job) => {
    let jobs = this.getJobs();
    jobs.push(job);
    window.localStorage.setItem('jobs', JSON.stringify(jobs));
  };

  changeStudent = (jobId, studentName) => {
    let students = this.getUsernames();
    let jobs = this.getJobs();
    jobs.forEach(job => {
      if (job.id == jobId) {
        students.forEach((student, index) => {
          if (student.student == studentName) {
            if (students[index].job == '') students[index].job = job.job;
            else students[index].job += `, ${job.job}`;
          }
        });
      }
    });
    window.localStorage.setItem('usernames', JSON.stringify(students));
  };

  changeJob = (jobId, status) => {
    let jobs = this.getJobs();
    jobs.forEach((job, index) => {
      if (job.id == jobId) {
        jobs[index].status = parseInt(status);
      }
    });
    window.localStorage.setItem('jobs', JSON.stringify(jobs));
  };

  initJobStudent = (allocations) => {
    let jobs = this.getJobs();
    let students = this.getUsernames();
    allocations.forEach(allocation => {
      jobs.forEach(job => {
        if (job.id == allocation.idTrabalho) {
          students.forEach((student, index) => {
            if (student.student == allocation.idAluno) {
              if (student.job == '') students[index].job = job.job;
              else students[index].job += `, ${job.job}`;
            }
          });
        }
      });
    });
    window.localStorage.setItem('usernames', JSON.stringify(students));
  }

  showStudentModal = () => {
    this.setState({ studentVisible: true });
  };

  showJobModal = () => {
    this.setState({ jobVisible: true });
  };

  showJobChangeModal = (jobId) => {
    this.setState({ jobChangeId: jobId });
    this.setState({ jobChangerVisible: true });
  };

  showJobAllocationModal = (jobId) => {
    this.setState({ jobChangeId: jobId });
    this.setState({ jobAllocationVisible: true });
  }

  handleStudentOk = () => {
    let formattedUsername = this.state.username.trim().replace(/ /g, '').toLowerCase();
    this.setState({ studentLoading: true });
    axios({
      url: `${this.baseUrl}/aluno`,
      method: 'POST',
      data: { username: formattedUsername }
    }).then(() => {
      this.setState({ studentVisible: false, studentLoading: false });
      this.setState({ username: '' });
      this.setUsernames({ student: formattedUsername, job: '' });
      this.props.history.push('/');
    }).catch(err => {
      console.log(err);
      this.setState({ username: '' });
    });
  };

  handleStudentCancel = () => {
    this.setState({ studentVisible: false });
  };

  handleStudentChange = ({ target: { value } }) => {
    this.setState({ username: value });
  };

  handleStudentSearch = ({ target: { value } }) => {
    this.setState({ jobSearch: value });
  };

  handleJobOk = () => {
    let formattedJob = this.state.job.trim();
    this.setState({ jobLoading: true });
    axios({
      url: `${this.baseUrl}/trabalho`,
      method: 'POST',
      data: { titulo: formattedJob }
    }).then((result) => {
      this.setState({ jobVisible: false, jobLoading: false });
      this.setState({ job: '' });
      let biggerKey = 0;
      this.getJobs().forEach(job => {
        biggerKey = job.key;
      });
      this.setJobs({ key: biggerKey + 1, id: result.data.pop().id, job: formattedJob, status: 0 });
      this.props.history.push('/');
    }).catch(err => {
      console.log(err);
      this.setState({ job: '' });
    });
  };

  handleJobCancel = () => {
    this.setState({ jobVisible: false });
  };

  handleJobChange = ({ target: { value } }) => {
    this.setState({ job: value });
  };

  handleJobChangeOk = () => {
    this.setState({ jobChangeLoading: true });
    axios({
      url: `${this.baseUrl}/trabalho/percentual/${this.state.jobChangeId}/${this.state.jobChangeStatus}`,
      method: 'PUT'
    }).then(() => {
      this.setState({ jobChangerVisible: false, jobChangeLoading: false });
      this.changeJob(this.state.jobChangeId, this.state.jobChangeStatus);
      this.setState({ jobChangeId: '', jobChangeStatus: '' });
    })
  };

  handleJobChangeCancel = () => {
    this.setState({ jobChangerVisible: false });
  };

  handleJobChangeStatus = ({ target: { value } }) => {
    this.setState({ jobChangeStatus: value });
  };

  handleJobAllocationOk = () => {
    this.setState({ jobAllocationLoading: true });
    axios({
      url: `${this.baseUrl}/alocacao/${this.state.jobChangeId}/${this.state.jobAllocationValue}`,
      method: 'PUT'
    }).then(() => {
      this.setState({ jobAllocationVisible: false, jobAllocationLoading: false });
      this.changeStudent(this.state.jobChangeId, this.state.jobAllocationValue);
      this.setState({ jobAllocationValue: '' });
    });
  }

  handleJobAllocationChange = ({ target: { value } }) => {
    this.setState({ jobAllocationValue: value });
  };

  handleJobAllocationCancel = () => {
    this.setState({ jobAllocationVisible: false });
  };

  componentDidMount() {
    document.title = 'bad time';
    window.localStorage.setItem('usernames', '[]');
    window.localStorage.setItem('jobs', '[]');

    axios({
      url: `${this.baseUrl}/aluno`,
      method: 'GET'
    }).then(result => {
      result.data.forEach((student, index) => {
        this.setUsernames({ key: index, student: student.id, job: '' });
      });
      axios({
        url: `${this.baseUrl}/alocacao`,
        method: 'GET'
      }).then(result => {
        this.initJobStudent(result.data);
        this.setState({ studentReady: true });
      }).catch(err => {
        console.log(err);
        this.setState({ studentReady: true });
      });
    }).catch(err => {
      this.setState({ studentReady: true });
      console.log(err);
    });

    axios({
      url: `${this.baseUrl}/trabalho`,
      method: 'GET'
    }).then(result => {
      result.data.forEach((job, index) => {
        this.setJobs({ key: index, id: job.id, job: job.titulo, status: job.percentual });
      });
      this.setState({ jobReady: true });
    }).catch(err => {
      this.setState({ jobReady: true });
      console.log(err);
    });
  }

  render() {
    const { studentVisible, studentLoading, studentReady, jobReady, jobVisible, jobLoading, jobChangeLoading, jobChangerVisible, jobAllocationLoading, jobAllocationVisible } = this.state;
    let studentTableContent = '';
    let jobTableContent = '';
    if (studentReady) studentTableContent = (
      <div>
        <Title level={4}>Alunos</Title>
        <Table dataSource={this.getUsernames()} columns={this.studentColumns} />
      </div>
    );
    if (jobReady) jobTableContent = (
      <div>
        <Title level={4}>Trabalhos</Title>
        <Table dataSource={this.getJobs()} columns={this.jobColumns} />
      </div>
    );
    return (
      <Layout style={{ width: '100%', height: '100%' }}>
        <Sider width={200}>
          <img className='logo' src='https://pa1.narvii.com/6120/71c5295771bc14000a0a4ab313a08be10b85743e_00.gif' />
          <Menu defaultSelectedKeys={['1']} defaultOpenKeys={['1']} mode='inline' theme='dark'>
            <SubMenu key='1' icon={<PieChartOutlined />} title='Dashboard'>
              <Menu.Item key='2' icon={<PlusOutlined />} onClick={this.showStudentModal}>Aluno</Menu.Item>
              <Menu.Item key='3' icon={<PlusOutlined />} onClick={this.showJobModal}>Trabalho</Menu.Item>
            </SubMenu>
          </Menu>
        </Sider>
        <Layout>
          <Content>
            <div style={{ padding: 24, minHeight: 360 }}>
              <Row>
                <Col span={9}>{studentTableContent}</Col>
                <Col span={1}></Col>
                <Col span={13}>{jobTableContent}</Col>
              </Row>
            </div>
          </Content>
        </Layout>
        <Modal title='Novo aluno' visible={studentVisible} onOk={this.handleStudentOk} onCancel={this.handleStudentCancel} footer={[
          <Button key='back' onClick={this.handleStudentCancel}>Cancelar</Button>,
          <Button key='submit' type='primary' loading={studentLoading} onClick={this.handleStudentOk} htmlType='submit'>Criar</Button>,
        ]}>
          <Input prefix={<UserOutlined />} placeholder='Nome' onChange={this.handleStudentChange} />
        </Modal>
        <Modal title='Novo trabalho' visible={jobVisible} onOk={this.handleJobOk} onCancel={this.handleJobCancel} footer={[
          <Button key='back' onClick={this.handleJobCancel}>Cancelar</Button>,
          <Button key='submit' type='primary' loading={jobLoading} onClick={this.handleJobOk} htmlType='submit'>Criar</Button>,
        ]}>
          <Input prefix={<BuildOutlined />} placeholder='Trabalho' onChange={this.handleJobChange} />
        </Modal>
        <Modal width={280} title='Alterar status' visible={jobChangerVisible} onOk={this.handleJobChangeOk} onCancel={this.handleJobChangeCancel} footer={[
          <Button key='back' onClick={this.handleJobChangeCancel}>Cancelar</Button>,
          <Button key='submit' type='primary' loading={jobChangeLoading} onClick={this.handleJobChangeOk} htmlType='submit'>Alterar</Button>,
        ]}>
          <Input suffix={<PercentageOutlined />} placeholder='Status' onChange={this.handleJobChangeStatus} />
        </Modal>
        <Modal width={280} title='Alocar aluno' visible={jobAllocationVisible} onOk={this.handleJobAllocationOk} onCancel={this.handleJobAllocationCancel} footer={[
          <Button key='back' onClick={this.handleJobAllocationCancel}>Cancelar</Button>,
          <Button key='submit' type='primary' loading={jobAllocationLoading} onClick={this.handleJobAllocationOk} htmlType='submit'>Alocar</Button>,
        ]}>
          <Input prefix={<UserOutlined />} placeholder='Aluno' onChange={this.handleJobAllocationChange} />
        </Modal>
      </Layout>
    );
  }
}

export default Dash;